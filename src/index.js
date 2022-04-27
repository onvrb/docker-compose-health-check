const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require("path");
const { dump } = require('js-yaml');
const { exit } = require('process');

// import locals
const myImport = require('./import.js'); 
const myHc = require('./health-check.js');

// get inputs
try {
    // dchc yaml parser
    const services = myImport.getDockerComposeServices(yaml.load(fs.readFileSync(path.resolve(__dirname, '../labels-example.yml'), 'utf8')));
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
