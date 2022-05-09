import core from '@actions/core';
import github from '@actions/github';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// import locals
import * as myImport from './import'; 
import * as myHc from './health-check';

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
