"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// standard actions and github api libraries
const core = __importStar(require("@actions/core"));
const process_1 = require("process");
const YAML = __importStar(require("yamljs"));
const checks_1 = __importDefault(require("./checks"));
const path = __importStar(require("path"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core.info("Starting health check 🚀");
            const wd = process.env[`GITHUB_WORKSPACE`] || "";
            core.debug(`GITHUB_WORKSPACE: ${wd}`);
            const yamlFile = core.getInput("docker-compose-file") || path.join(wd, "docker-compose.yml");
            core.debug(`Using docker-compose file: ${yamlFile}`);
            const composeConfig = YAML.load(yamlFile);
            core.debug(`Loaded docker-compose file: ${JSON.stringify(composeConfig)}`);
            // grab the services from the compose file
            const services = composeConfig.services;
            core.debug(`Found ${Object.keys(services).length} services`);
            // loop through the services
            for (const serviceName in services) {
                core.debug(`Checking service: ${serviceName}`);
                // get the service definition
                const service = services[serviceName];
                core.debug(`Found service: ${JSON.stringify(service)}`);
                core.debug(`Found ${Object.keys(service.ports).length} ports`);
                // loop trought the ports on the service definition
                for (const port of service.ports) {
                    core.debug(`Checking port: ${port}`);
                    let portNumber = 0;
                    // convert the port to a number
                    switch (typeof port) {
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
                            process_1.exit(1);
                            break;
                        }
                    }
                    core.info(`Checking port ${portNumber} for service ${serviceName}...`);
                    if (yield checks_1.default(portNumber)) {
                        core.info(`Service: ${serviceName} / Port: ${portNumber} / Status: 🟢`);
                    }
                    else {
                        core.setFailed(`Service: ${serviceName} / Port: ${portNumber} / Status: 🔴`);
                    }
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
        }
        finally {
            core.info("Finished health check...");
        }
    });
}
void run();
