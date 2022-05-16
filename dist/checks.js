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
const node_net_1 = __importDefault(require("node:net"));
function checkService(service) {
    return __awaiter(this, void 0, void 0, function* () {
        // loop trought the ports on the service definition
        for (const port of service.ports) {
            core.debug(`Checking port: ${port}`);
            let portNumber = 0;
            // convert the port to a number
            switch (typeof port) {
                case 'string': {
                    portNumber = Number(port.split(':')[0]);
                    if (isNaN(portNumber)) {
                        core.setFailed(`Service: ${service.name} / Value: ${port} / Invalid format`);
                    }
                    break;
                }
                case 'number': {
                    portNumber = Number(port);
                    break;
                }
                default: {
                    core.setFailed(`Service: ${service.name} / Value: ${port} / Invalid port type: ${typeof port}`);
                    break;
                }
            }
            core.info(`Checking port ${portNumber} for service ${service.name}...`);
            //    if (await checkTCP(portNumber)) {
            //      core.info(`Service: ${service.name} / Port: ${portNumber} / Status: 🟢`)
            //   } else {
            //    core.setFailed(`Service: ${service.name} / Port: ${portNumber} / Status: 🔴`)
            // }
        }
    });
}
exports.default = checkService;
function checkTCP(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const host = '127.0.0.1';
        const promise = new Promise((resolve, reject) => {
            const socket = new node_net_1.default.Socket();
            const onError = () => {
                socket.destroy();
                reject();
            };
            socket.setTimeout(1000);
            socket.once('error', onError);
            socket.once('timeout', onError);
            socket.connect(options.port, host, () => {
                socket.end();
                resolve(true);
            });
        });
        try {
            yield promise;
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
