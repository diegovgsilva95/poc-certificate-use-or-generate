# Overview
This project is designed for educational purposes to demonstrate how HTTPS certificates can be dynamically generated and managed. It's a proof-of-concept for an HTTPS certificate setup. If a valid certificate pair is present inside `.env`, the server uses it. However, if there's no specified certificate, or if it finds error loading the file, it'll automatically generate a new certificate (and its private key) on-the-fly (thanks to `node-forge`). It's worth mentioning that this generated certificate pair is not self-signed, as it would generally be. Instead, it's signed by a self-signed CA. This way, a dev could add this CA to the trusted Certification Authorities and every certificate this project generates would be valid. I guess I don't need to mention again the PoC nature of this project: **DO NOT USE THIS IN PRODUCTION AND/OR DEVELOPMENT ENVIRONMENT, AT ANY COST...**

# Warning
**DO NOT USE THIS IN PRODUCTION AND/OR DEVELOPMENT ENVIRONMENT, AT ANY COST...** 
I repeat: **DO NOT USE THIS IN PRODUCTION AND/OR DEVELOPMENT ENVIRONMENT, AT ANY COST...**
Even at your development environment, avoid the usage of this project and/or its concepts, as it's merely a Proof-of-Concept. 

# Dependencies
- `node-forge`
- `moment`
- `express`
- `dotenv`

# Generating CA pair
Even considering this a PoC, as a (boring) measure of security you should generate a certificate pair before anything else. Use the OpenSSL to generate a pair named CA.key and CA.crt (private key and certificate) inside the root folder of this project:

```sh
openssl req -new -nodes -x509 -newkey rsa:4096 -extensions v3_ca -keyout CA.key -out CA.crt -days 365
```