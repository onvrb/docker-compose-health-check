import net from 'node:net'
import core from '@actions/core'

interface TcpResponse {
    host: string
    port: number
    reachable: boolean
}

export default async function tcp(port: number, { host = "archive.ubuntu.com", timeout = 1000 } = {}): Promise<TcpResponse> {
    return new Promise(((resolve, reject) => {
        const socket = new net.Socket();

        const onError = () => {
            socket.destroy();
            reject({host, port, reachable: false});
        };

        const onConnect = () => {
            socket.end();
            resolve({host, port, reachable: true});
        }

        socket.setTimeout(timeout);
        socket.once('error', onError);
        socket.once('timeout', onError);
        socket.connect(port, host, onConnect);
    }));
}
