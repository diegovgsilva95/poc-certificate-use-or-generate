import * as os from "os"
export const mapInterfaceIPs = function(){
    let ipv4 = [],
        ipv6 = [],
        hostnames = ["localhost"]

    for(let [_, ifaceIPs] of Object.entries(os.networkInterfaces())){
        for(let {address, family} of ifaceIPs){
            if(family == "IPv4")
                ipv4.push(address)
            if(family == "IPv6")
                ipv6.push(address)

        }
    }
    hostnames.push(os.hostname())
    hostnames.push(os.hostname() + ".local")
    
    if(typeof process.env.DOMAIN === "string")
        for(let domain of process.env.DOMAIN.split(","))
            hostnames.push(domain)
    
    return [
        ...ipv4.map(ip => ({type: "ipv4", value: ip})), 
        ...ipv6.map(ip => ({type: "ipv6", value: ip})), 
        ...hostnames.map(name => ({type: "name", value: name}))]
}