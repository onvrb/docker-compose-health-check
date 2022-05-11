// standard actions and github api libraries
import * as core from '@actions/core'
import * as github from '@actions/github'

import { type } from 'os';
import { exit } from "process";

import * as YAML from "yamljs";

import checkPort from "./checks";

import path from "path";


async function run(): Promise<void> {

        core.info("Starting health check");
        const wd: string = process.env[`GITHUB_WORKSPACE`] || "";

        const yamlFile = core.getInput("docker-compose-file") || path.join(wd, "docker-compose.yml");
        const composeConfig = YAML.load(yamlFile);

        // grab the services from the compose file
        const services = composeConfig.services;

        // loop through the services
        for (const serviceName in services) {
            // get the service definition
            const service = services[serviceName];
 
            // loop trought the ports on the service definition
            for (const port of service.ports as (string | number)[]) {
                let portNumber = 0;
                // convert the port to a number
                switch(typeof port) {
                    case "string": {
                        portNumber = Number(port.split(":")[0]);
                        if (isNaN(portNumber)) {
                            core.setFailed(`Service: ${serviceName} / Value: ${port} / Invalid format`);
                        }
                        break;
                    }
                    case "number": {
                        portNumber = Number(port);
                        break;
                    }
                    default: {
                        core.setFailed(`Service: ${serviceName} / Value: ${port} / Invalid port type: ${typeof port}`);
                        // log error
                        break;
                    }
                }
                core.info(`Checking port ${portNumber} for service ${serviceName}...`);
                if (await checkPort(portNumber)) {
                    core.info(`Service: ${serviceName} / Port: ${portNumber} / Status: up`);
                } else {
                    core.setFailed(`Service: ${serviceName} / Port: ${portNumber} / Status: down`);
                }
            }
        }
        core.info("Finished health check");
}

void run()

