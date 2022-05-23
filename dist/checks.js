"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const node_net_1 = __importDefault(require("node:net"));
function checkServices(service) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const portConfig of service.ports) {
            const port = String(portConfig.port);
            const config = typeof portConfig.config === 'object' ? portConfig.config : {};
            const dchc = typeof config['dchc'] === 'object' ? config['dchc'] : {};
            const dchcPort = typeof dchc['port'] === 'object' ? dchc['port'] : {};
            const mainConfig = typeof dchcPort[port] === 'object' ? dchcPort[port] : {};
            const protocol = typeof mainConfig['protocol'] === 'string' ? mainConfig['protocol'] : 'tcp';
            let retCheck = false;
            switch (protocol) {
                default:
                    retCheck = yield checkTCP(port, mainConfig);
                    break;
            }
            if (retCheck) {
                core.info(`Service: ${service.name} / Port: ${port} / Status: 🟢`);
            }
            else {
                core.setFailed(`Service: ${service.name} / Port: ${port} / Status: 🔴`);
            }
        }
    });
}
exports.default = checkServices;
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(() => resolve(true), ms)).then(() => { });
    });
}
function checkTCP(port, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const host = '127.0.0.1';
        const portNumber = Number(port);
        const timeout = isNaN(Number(options['timeout'])) ? 1000 : Number(options['timeout']);
        const retries = isNaN(Number(options['retries'])) ? 5 : Number(options['retries']);
        const interval = isNaN(Number(options['interval'])) ? 1000 : Number(options['interval']);
        for (let r = 0; r < retries; r++) {
            const promise = new Promise((resolve, reject) => {
                const socket = new node_net_1.default.Socket();
                const onError = () => {
                    socket.destroy();
                    reject();
                };
                socket.setTimeout(timeout);
                socket.once('error', onError);
                socket.once('timeout', onError);
                socket.once('connect', () => {
                    socket.destroy();
                    resolve(true);
                });
                socket.connect(portNumber, host);
            });
            try {
                yield promise;
                return true;
            }
            catch (_a) {
                yield delay(interval);
            }
        }
        return false;
    });
}
//# sourceMappingURL=checks.js.map