"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.mysql = void 0;
const core_1 = __importDefault(require("@actions/core"));
const net_1 = __importDefault(require("net"));
// import node-fetch v3 https://github.com/node-fetch/node-fetch#commonjs
const fetch = (...args) => Promise.resolve().then(() => __importStar(require('node-fetch'))).then(({ default: fetch }) => fetch(...args));
function tcp(key, value) {
    console.log(`Running TCP check for ${key}`);
    const client = new net_1.default.Socket();
    client.setTimeout(value.timeout * 1000);
    client.connect(value.port, value.hostname, () => {
        console.log(`${key} is up`);
        client.end();
    });
    client.on('error', (error) => {
        console.log(`${key} is down`);
        client.end();
    });
}
function http(key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Running HTTP check for ${key}`);
        const url = `${value.protocol}://${value.hostname}:${value.port}${value.http.endpoint}`;
        for (let i = 0; i < value.retries; i++) {
            try {
                var response = yield fetch(url, {
                    method: value.http.method,
                });
                if (response.ok) { // if response is ok, break loop
                    break;
                }
                return;
            }
            catch (error) { // if error, print error
                console.log(`HTTP check for ${key} failed (attempt ${i} of ${value.retries} every ${value.timeout} seconds): ${error}`);
            }
            yield new Promise(resolve => setTimeout(resolve, value.timeout * 1000)); // and retry every value.timeout seconds
            if (i === value.retries - 1) { // if we've reached the last attempt
                core_1.default.setFailed(`HTTP check for ${key} failed after ${value.retries} attempts`); // set failed
            }
        }
        console.log(`Finished HTTP check for ${key} with status code ${response.status}`);
    });
}
function mysql(key, value) {
    console.log(`Running mysql check for ${key}`);
}
exports.mysql = mysql;
