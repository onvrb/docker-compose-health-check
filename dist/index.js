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
const core = __importStar(require("@actions/core"));
const YAML = __importStar(require("yamljs"));
const path = __importStar(require("path"));
const dot_properties_1 = require("dot-properties");
const checks_1 = __importDefault(require("./checks"));
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!process.env['CI']) {
                require('source-map-support').install();
            }
            core.info('Starting health check 🚀');
            const wd = process.env['GITHUB_WORKSPACE'] || '';
            core.debug(`GITHUB_WORKSPACE: ${wd}`);
            const yamlFile = core.getInput('docker-compose-file') || path.join(wd, 'docker-compose.yml');
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
                core.debug(`Found service: ${JSON.stringify(service)} with ${Object.keys(service.ports).length} ports`);
                if (service.ports === undefined) {
                    core.setFailed(`Service ${serviceName} has no ports defined`);
                }
                if (service.labels === undefined) {
                    core.info(`Service ${serviceName} has no labels defined, consider setting appropriate labels. Using defaults.`);
                    service.labels = [];
                }
                const config = {
                    name: serviceName,
                    ports: []
                };
                for (const port of service.ports) {
                    let portNumber = 0;
                    if (typeof port === 'string') {
                        if (port.endsWith('/udp')) {
                            core.info(`Service ${serviceName} has a UDP port: ${port}, not supported. TCP will be used instead.`);
                        }
                        portNumber = Number(port.split(':')[0]);
                    }
                    else {
                        portNumber = Number(port);
                    }
                    const filteredLabels = service.labels
                        .filter(label => {
                        return label.includes(`.${portNumber}.`);
                    })
                        .join('\n');
                    let configPort = {
                        port: portNumber,
                        config: dot_properties_1.parse(filteredLabels, true)
                    };
                    config.ports.push(configPort);
                }
                yield checks_1.default(config);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
                console.log((_a = error.stack) === null || _a === void 0 ? void 0 : _a.split('\n'));
            }
        }
        finally {
            core.info('Finished health check...');
        }
    });
}
void run();
//# sourceMappingURL=index.js.map