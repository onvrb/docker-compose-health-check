import * as check from './protocols';

// check protocol and call function
export function healthCheck(services) {
    for (const [key, value] of Object.entries(services)) {
        if (value.enable === 'true') {
            switch (value.protocol) {
                case 'tcp':
                    check.tcp(key, value);
                    break;
                case 'http':
                case 'https':
                    check.http(key, value);
                    break;
                case 'mysql':
                    check.mysql(key, value);
                    break;
                default:
                    core.setFailed(`Unsupported protocol for ${key}`);
            }
        }
        else { console.log(`Skipping check for ${key} (not enabled)`); }
    }
}