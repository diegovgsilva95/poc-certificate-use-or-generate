import { log, warn } from "console"
import { readFile } from "fs/promises"
import moment from "moment"
import forge from "node-forge"
import { CA_CRT, CA_KEY } from "./loader-ca.mjs"
import { getCertInfo } from "./cert-viewer.mjs"
import { mapInterfaceIPs } from "./node-utils.mjs"
const { pki, md} = forge

const getModulusMD5 = function(certOrKey) {
    if(certOrKey == null || typeof certOrKey !== "object")
        return null

    const modulus = certOrKey.n || certOrKey.publicKey.n || null
    if(modulus == null)
        return null
    
    const modulusHex = modulus.toString(16)
    return md.md5.create().update(modulusHex).digest().toHex()
}
const generatePair = async function(keySize, CA_CRT, CA_KEY){

    /** @type {forge.pki.rsa.PrivateKey} */
    let caKeyObj
    /** @type {forge.pki.Certificate} */
    let caCrtObj
    let hasCA = false
    let caRet = {}

    if(typeof CA_KEY === "string" && typeof CA_CRT === "string"){
        hasCA = true
        caRet.ca = CA_CRT
        caKeyObj = pki.privateKeyFromPem(CA_KEY)
        caCrtObj = pki.certificateFromPem(CA_CRT) 
    }
    
    let keyObj = pki.rsa.generateKeyPair(keySize || 2048)
    let certObj = pki.createCertificate()
    
    certObj.publicKey = keyObj.publicKey
    certObj.serialNumber = "01"
    certObj.validity.notBefore = moment().toDate()
    certObj.validity.notAfter = moment().add(365, "days").toDate()
    
    let attrs = [
        { name:      'commonName',        value:'localhost'},
        { name:      'countryName',       value:'BR'},
        // { shortName: 'ST',                value:'Sao-Paulo'},
        // { name:      'localityName',      value:'Campinas'},
        // { name:      'organizationName',  value:'Your ORG'},
        // { shortName: 'OU',                value:'Your Unit'},
    ]
    
    certObj.setSubject(attrs)
    if(hasCA)
        certObj.setIssuer(caCrtObj.issuer.attributes)
    else
        certObj.setIssuer(attrs)

    let altNames = []

    for(let item of mapInterfaceIPs()){
        let obj = {}
        obj.type = (item.type.startsWith("ip") ? 7 : 2)
        if(obj.type==7)
            obj.ip = item.value
        else
            obj.value = item.value
        altNames.push(obj)
    }

    certObj.setExtensions([{
		name: 'subjectAltName',
		altNames
    }])
    if(hasCA)
        certObj.sign(caKeyObj, forge.md.sha256.create())
    else
        certObj.sign(keyObj.privateKey)

    return {
        cert: pki.certificateToPem(certObj),
        key: pki.privateKeyToPem(keyObj.privateKey),
        ...caRet
    }

}
const loadOrGenerate = async function(forceGenerate = false){
    let generate = false
    /** @type {string[]} */
    let [cert, key, ca] = [null, null, null]

    if(forceGenerate || process.env.HTTPS_CRT_FILE=="generated" || process.env.HTTPS_KEY_FILE=="generated"){
        generate = true
        log(`[Cert] Generating new certificate...`)
    } else
        try {
            if(typeof process.env.HTTPS_CRT_FILE !== "string") throw TypeError()
            cert = await readFile(process.env.HTTPS_CRT_FILE, "utf-8")
            if(typeof process.env.HTTPS_KEY_FILE !== "string") throw TypeError()
            key = await readFile(process.env.HTTPS_KEY_FILE, "utf-8")
            log(`[Cert] Successfully loaded provided certificate.`)
        }
        catch(e){
            generate = true
            log(`[Cert] Generating new certificate...`)
        }
        
        try {
            if(typeof process.env.HTTPS_CA_FILE !== "string") throw TypeError()
            ca = await readFile(process.env.HTTPS_CA_FILE, "utf-8")
        }catch(e){}

    if(generate){
        let pair = await generatePair(2048, CA_CRT, CA_KEY)
        cert = pair.cert
        key = pair.key
        ca = pair.ca || null
    }

    return {cert, key, ca}

}

// Try to open files, if not possible, generate.

let {cert, key, ca} = await loadOrGenerate()
let certInfo = pki.certificateFromPem(cert)
let keyInfo = pki.privateKeyFromPem(key)
let caInfo = typeof ca == "string" ? pki.certificateFromPem(ca) : null

let certModulus = getModulusMD5(certInfo)
let keyModulus = getModulusMD5(keyInfo) 

if(certModulus == null || certModulus != keyModulus){
    warn(`[Cert] WARNING: Certificate does not match the private key or one of them is invalid! Generating anew...`)
    let generated = await loadOrGenerate(true)
    cert = generated.cert
    key = generated.key
    ca = generated.ca
    certInfo = pki.certificateFromPem(cert)
    keyInfo = pki.privateKeyFromPem(key)
    caInfo = typeof ca == "string" ? pki.certificateFromPem(ca) : null
}
if(!ca){
    warn("[cert] No certification authority is present. ")
}
log("[Cert] Got cert pair. Info:\n------------- ")
caInfo && log("CA", getCertInfo(caInfo))
log("Cert", getCertInfo(certInfo))
log("-------------")

// log(certInfo.getExtension("subjectAltName"))
export {cert, key, ca}