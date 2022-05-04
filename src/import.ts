const PREFIX = 'dchc';
const MY_SERVICES = {};
const DEFAULTS = {
    'enable': 'false',
    'protocol': 'tcp',
    'hostname': 'localhost',
    'port': '80',
    'http': {
        'endpoint': '/',
        'method': 'GET',
    },
    'timeout': '5',
    'retries': '10',
};

function getDockerComposeServices(doc) {
    for (const [key, value] of Object.entries(doc.services)) {                          // for every service
        MY_SERVICES[key] = { ...DEFAULTS };                                             // add key to MY_SERVICES with default values
        if (Array.isArray(value.labels)) {                                              // if labels is an array (not empty)
            for (const label of value.labels) {                                         // for every label
                if (label.startsWith(PREFIX)) {                                         // if the label starts with PREFIX
                    const label_key = label.replace(PREFIX + '.', '');                  // remove PREFIX
                    const new_keys = label_key.split('=')[0].split('.');                // get new keys
                    const new_label = label_key.split('=')[1];                          // get new label
                    let cur = MY_SERVICES[key];                                         // get current key
                    for (const key of new_keys.slice(0, new_keys.length - 1)) {         // for every new key
                        if (!cur[key]) {                                                // if key doesn't exist
                            cur[key] = {};                                              // add key to MY_SERVICES
                        }
                        cur = cur[key];                                                 // set current key to new key
                    }
                    cur[new_keys[new_keys.length - 1]] = new_label;                     // set current key to new label
                }
            }
        }
    }
    return MY_SERVICES;
}

module.exports = {
    getDockerComposeServices,
};
