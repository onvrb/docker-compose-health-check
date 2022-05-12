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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_net_1 = __importDefault(require("node:net"));
function checkPort(port, { host = 'localhost', timeout = 1000 } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof host !== 'string') {
            throw new TypeError('Specify a `host`');
        }
        const promise = new Promise((resolve, reject) => {
            const socket = new node_net_1.default.Socket();
            const onError = () => {
                socket.destroy();
                reject();
            };
            socket.setTimeout(timeout);
            socket.once('error', onError);
            socket.once('timeout', onError);
            socket.connect(port, host, () => {
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
exports.default = checkPort;
