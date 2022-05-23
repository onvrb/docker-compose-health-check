import * as core from '@actions/core'
import * as YAML from 'yamljs'
import * as path from 'path'
import type {ServiceDef, PortDef} from './checks'
import {parse, parseLines, stringify} from 'dot-properties'
import checkServices from './checks'

interface YAMLSchema {
  services: {
    [key: string]: {
      labels?: string[]
      ports: (string | number)[]
    }
  }
}

async function run(): Promise<void> {
  try {
    if (!process.env['CI']) {
      require('source-map-support').install()
    }

    core.info('Starting health check 🚀')
    const wd: string = process.env['GITHUB_WORKSPACE'] || ''
    core.debug(`GITHUB_WORKSPACE: ${wd}`)

    const yamlFile = core.getInput('docker-compose-file') || path.join(wd, 'docker-compose.yml')
    core.debug(`Using docker-compose file: ${yamlFile}`)

    const composeConfig = YAML.load(yamlFile) as YAMLSchema
    core.debug(`Loaded docker-compose file: ${JSON.stringify(composeConfig)}`)

    // grab the services from the compose file
    const services = composeConfig.services
    core.debug(`Found ${Object.keys(services).length} services`)

    // loop through the services
    for (const serviceName in services) {
      core.debug(`Checking service: ${serviceName}`)

      // get the service definition
      const service = services[serviceName]
      core.debug(`Found service: ${JSON.stringify(service)} with ${Object.keys(service.ports).length} ports`)

      if (service.ports === undefined) {
        core.setFailed(`Service ${serviceName} has no ports defined`)
      }

      if (service.labels === undefined) {
        core.info(`Service ${serviceName} has no labels defined, consider setting appropriate labels. Using defaults.`)
        service.labels = []
      }

      const config: ServiceDef = {
        name: serviceName,
        ports: []
      }

      for (const port of service.ports) {
        let portNumber = 0

        if (typeof port === 'string') {
          if (port.endsWith('/udp')) {
            core.info(`Service ${serviceName} has a UDP port: ${port}, not supported. TCP will be used instead.`)
          }
          portNumber = Number(port.split(':')[0])
        } else {
          portNumber = Number(port)
        }

        const filteredLabels = service.labels
          .filter(label => {
            return label.includes(`.${portNumber}.`)
          })
          .join('\n')

        let configPort: PortDef = {
          port: portNumber,
          config: parse(filteredLabels, true)
        }

        config.ports.push(configPort)
      }
      await checkServices(config)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
      console.log(error.stack?.split('\n'))
    }
  } finally {
    core.info('Finished health check...')
  }
}

void run()
