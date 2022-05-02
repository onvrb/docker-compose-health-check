// import node-fetch v3 https://github.com/node-fetch/node-fetch#commonjs
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function tcp(key, value) {
    console.log(`Running TCP check for ${key}`);
}

async function http(key, value) {
    console.log(`Running HTTP check for ${key}`);
    // const url = `${value.protocol}://${value.hostname}:${value.port}${value.endpoint}`;
    const url = 'https://api.github.com/';

    for (let i = 1; i <= value.retries; i++) {
        try {
            var response = await fetch(url);
            if (response.ok) {
                break;
            }
            // console.log(response);
            return;
        } catch (error) {
            console.log(`HTTP check for ${key} failed (attempt ${i} of ${value.retries} every ${value.timeout} seconds): ${error}`);
            // console.log(error);
        }
        // wait value.timeout seconds
        await new Promise(resolve => setTimeout(resolve, value.timeout * 1000));
    }
    console.log(`Finished HTTP check for ${key} with status code ${response.status}`);

}

function https(key, value) {
    console.log(`Running HTTPS check for ${key}`);
}

function mysql(key, value) {
    console.log(`Running mysql check for ${key}`);
}


module.exports = {
    tcp,
    http,
    https,
    mysql,
};