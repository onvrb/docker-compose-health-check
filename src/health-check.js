const checkConnection = require('./protocols.js');

function healthCheck(services) {
    for (const [key, value] of Object.entries(services)) {
        if (value.enable === 'true') {
            if (value.protocol === 'tcp') {
                checkConnection.tcp(key, value);
            } else if (value.protocol === 'http') {
                checkConnection.http(key, value);
            } else if (value.protocol === 'https') {
                checkConnection.https(key, value);
            } else if (value.protocol === 'mysql') {
                checkConnection.mysql(key, value);
            } else {
                throw new Error(`Unsupported protocol for ${key}`);
            }
        }
    }
}

module.exports = {
    healthCheck,
};