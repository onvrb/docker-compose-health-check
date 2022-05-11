import core from '@actions/core';
import { exit } from "process";
import * as YAML from "yamljs";

import tcp from "./tcp";

const composeConfig = YAML.load("docker-compose.yml");
// console.log(composeConfig.services);

// console log each port from each service
for (let serviceName in composeConfig.services) {
    console.log(serviceName);

    for (let servicePort of composeConfig.services[serviceName].ports as string[] | number[]) {
        let port = 0;
        
        if (typeof servicePort === "number"){
            port = servicePort;
        }

        if (typeof servicePort === "string"){
            port = Number(servicePort.split(":")[0]);       // left side of colon is exposed-to-host port
        }
        
        if (port === 0) {
            // core.setFailed(`Could not parse port from ${servicePort}`);
            console.log(`Could not parse port from ${servicePort}`);
            exit(1);
        }

        // check port
        console.log(port)
        console.log(tcp(port))
        // tcp(port);

    }

}

