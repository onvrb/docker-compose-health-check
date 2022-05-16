import * as core from '@actions/core'

import * as YAML from 'yamljs'

import checkService, { ServiceDef } from './checks'

import * as path from 'path'

async function run(): Promise<void> {
  try {
    core.info('Starting health check 🚀')
    const wd: string = process.env[`GITHUB_WORKSPACE`] || ''
    core.debug(`GITHUB_WORKSPACE: ${wd}`)

    const yamlFile = core.getInput('docker-compose-file') || path.join(wd, 'docker-compose.yml')
    core.debug(`Using docker-compose file: ${yamlFile}`)

    const composeConfig = YAML.load(yamlFile)
    core.debug(`Loaded docker-compose file: ${JSON.stringify(composeConfig)}`)

    // grab the services from the compose file
    const services = composeConfig.services
    core.debug(`Found ${Object.keys(services).length} services`)

    // loop through the services
    for (const serviceName in services) {
      core.debug(`Checking service: ${serviceName}`)

      // get the service definition
      const service = services[serviceName]
      core.debug(`Found service: ${JSON.stringify(service)}`)
      core.debug(`Found ${Object.keys(service.ports).length} ports`)

      const serviceDef: ServiceDef = {
        name: serviceName,
        labels: service.labels,
        ports: service.ports
      }

      console.log(serviceDef)

      checkService(serviceDef)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  } finally {
    core.info('Finished health check...')
  }
}

void run()
