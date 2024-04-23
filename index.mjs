import "dotenv/config"
import {httpsServer, app} from "./modules/loader-server.mjs"

app.use((req, res) => {
    res.end("<html><body><h1>All set!</h1></body></html>")
})
console.log(`[HTTPS] Started HTTPS server. Press Ctrl+C to terminate.`);