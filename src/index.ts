// standard actions and github api libraries
import * as core from '@actions/core'
import * as github from '@actions/github'

import {type} from 'os'
import {exit} from 'process'

import * as YAML from 'yamljs'

import checkPort from './checks'

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

      // loop trought the ports on the service definition
      for (const port of service.ports as (string | number)[]) {
        core.debug(`Checking port: ${port}`)
        let portNumber = 0
        // convert the port to a number
        switch (typeof port) {
          case 'string': {
            portNumber = Number(port.split(':')[0])
            if (isNaN(portNumber)) {
              core.setFailed(`Service: ${serviceName} / Value: ${port} / Invalid format`)
            }
            break
          }
          case 'number': {
            portNumber = Number(port)
            break
          }
          default: {
            core.setFailed(`Service: ${serviceName} / Value: ${port} / Invalid port type: ${typeof port}`)
            exit(1)
            break
          }
        }
        core.info(`Checking port ${portNumber} for service ${serviceName}...`)
        if (await checkPort(portNumber)) {
          core.info(`Service: ${serviceName} / Port: ${portNumber} / Status: 🟢`)
        } else {
          core.setFailed(`Service: ${serviceName} / Port: ${portNumber} / Status: 🔴`)
        }
      }
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
