import moment from "moment"
import forge from "node-forge"

const formatHexPairs = hexString => 
    [...hexString.match(/[0-9a-f]{2}/gi)].join(":")

/** 
 * @param {forge.pki.Certificate} certObj 
 * @param {forge.pki.rsa.PrivateKey} keyObj 
 */
export function getCertInfo(certObj, keyObj){
    
    return (
`Certificate:
    Version: ${certObj.version}
    Serial Number:
        ${formatHexPairs(certObj.serialNumber)}
    Signature Algorithm: ${certObj.siginfo.algorithmOid}
    Validity
        Not Before: ${moment(certObj.validity.notBefore).format("MMM DD HH:mm:ss YYYY ZZZ")}
        Not After : ${moment(certObj.validity.notAfter).format("MMM DD HH:mm:ss YYYY ZZZ")}
    Issuer.: ${certObj.issuer.attributes.map(x=>`${x.shortName}=${x.value}`).join(", ")}
    Subject: ${certObj.subject.attributes.map(x=>`${x.shortName}=${x.value}`).join(", ")}
    Subject Public Key Info:
        Public Key Algorithm: ${"???"}
            Public-Key: (${certObj.publicKey.n.bitLength()} bit)
            Modulus: ${formatHexPairs(Buffer.from(certObj.publicKey.n.toByteArray().slice(0,6)).toString("hex"))}...${formatHexPairs(Buffer.from(certObj.publicKey.n.toByteArray().slice(-6)).toString("hex"))}
            Exponent: ${certObj.publicKey.e.intValue()}`
    )
}