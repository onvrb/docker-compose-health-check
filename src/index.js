const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// import locals
const myImport = require('./import.js'); 
const myHc = require('./health-check.js');

// get inputs
try {
    const doc = fs.readFileSync(path.resolve(__dirname, '../labels-example.yml'), 'utf8');
    var services = myImport.getDockerComposeServices(yaml.load(doc));
} catch (error) {
    core.setFailed(error.message);
}

// health check
try {
    // ping containers
    myHc.healthCheck(services);

    // console.log(services);

    // console.log(MY_SERVICES.angelo.http.method);

} catch (error) {
    core.setFailed(error.message);
}
