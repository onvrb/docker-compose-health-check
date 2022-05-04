import core from '@actions/core';
import net from 'net';

// import node-fetch v3 https://github.com/node-fetch/node-fetch#commonjs
const fetch = (...args: string[]) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function tcp(key: any, value: { timeout: number; port: number; hostname: string; }) {
    console.log(`Running TCP check for ${key}`);

    const client = new net.Socket();
    client.setTimeout(value.timeout * 1000);
    client.connect(value.port, value.hostname, () => {
        console.log(`${key} is up`);
        client.end();
    }
    );
    client.on('error', (error) => {
        console.log(`${key} is down`);
        client.end();
    });
}

async function http(key: any, value: { protocol: string; hostname: string; port: number; http: { endpoint: string; method: string; }; retries: number; timeout: number; }) {
    console.log(`Running HTTP check for ${key}`);
    const url = `${value.protocol}://${value.hostname}:${value.port}${value.http.endpoint}`;

    for (let i = 0; i < value.retries; i++) {
        try {
            var response = await fetch(url, {                                       // try to fetch url
                method: value.http.method,
            });
            if (response.ok) {                                                      // if response is ok, break loop
                break;
            }
            return;
        } catch (error) {                                                           // if error, print error
            console.log(`HTTP check for ${key} failed (attempt ${i} of ${value.retries} every ${value.timeout} seconds): ${error}`);
        }
        await new Promise(resolve => setTimeout(resolve, value.timeout * 1000));    // and retry every value.timeout seconds
        if (i === value.retries - 1) {                                              // if we've reached the last attempt
            core.setFailed(`HTTP check for ${key} failed after ${value.retries} attempts`); // set failed
        }
    }
    console.log(`Finished HTTP check for ${key} with status code ${response.status}`);

}

function mysql(key: any, value: any) {
    console.log(`Running mysql check for ${key}`);
}


module.exports = {
    tcp,
    http,
    mysql,
};
