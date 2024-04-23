import express from "express"
import * as https from "https"

let app = express()
let {cert, key, ca} = await import("./loader-cert.mjs")
let httpsServer = https.createServer({
    cert, key, ca
}, app)

httpsServer.listen(process.env.HTTPS_PORT||8443, process.env.HTTPS_HOST||"0.0.0.0")

export {app, httpsServer}