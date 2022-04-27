
function tcp(key, value) {
    
}

function http(key, value) {
    console.log(`http check for ${key}`);

    const http = require('http');
    const options = {
        hostname: value.hostname,
        port: value.port,
        path: value.http.endpoint,
        method: value.http.method,
    };
    const req = http.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(`headers: ${JSON.stringify(res.headers)}`);
        res.on('data', (d) => {
            process.stdout.write(d);
        });

    // throw new Error(`Error on container ${key} using ${value.protocol} protocol`);
}

function https(key, value) {
    console.log('https check');
}

function mysql(key, value) {
    console.log('mysql check');
}


module.exports = {
    tcp,
    http,
    https,
    mysql,
};