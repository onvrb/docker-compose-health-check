const check = require('./protocols.js');

// check protocol and call function
function healthCheck(services) {
    for (const [key, value] of Object.entries(services)) {
        if (value.enable === 'true') {
            if (value.protocol === 'tcp') {
                check.tcp(key, value);
            } else if (value.protocol === 'http' || value.protocol === 'https') {
                check.http(key, value);
            } else if (value.protocol === 'mysql') {
                check.mysql(key, value);
            } else {
                throw new Error(`Unsupported protocol for ${key}`);
            }
        }
        else { console.log(`Skipping check for ${key} (not enabled)`); }
    }
}

module.exports = {
    healthCheck,
};