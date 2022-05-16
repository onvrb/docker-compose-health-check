import * as core from '@actions/core'
import net from 'node:net'

export interface ServiceDef {
  name: string
  //labels: {[key: string]: string}
  labels: string[]
  ports: (string | number)[]
}

interface CheckPortOptions {
  port: number
  enabled?: boolean
  timeout?: number
  retries?: number
  protocol: string
  configHttp?: {
    uri: string
    hostheader: string
    method: string
  }
}

export default async function checkService(service: ServiceDef) {
  // loop trought the ports on the service definition
  for (const port of service.ports as (string | number)[]) {
    core.debug(`Checking port: ${port}`)
    let portNumber = 0
    // convert the port to a number
    switch (typeof port) {
      case 'string': {
        portNumber = Number(port.split(':')[0])
        if (isNaN(portNumber)) {
          core.setFailed(`Service: ${service.name} / Value: ${port} / Invalid format`)
        }
        break
      }
      case 'number': {
        portNumber = Number(port)
        break
      }
      default: {
        core.setFailed(`Service: ${service.name} / Value: ${port} / Invalid port type: ${typeof port}`)
        break
      }
    }
    core.info(`Checking port ${portNumber} for service ${service.name}...`)

    const options = parseConfig(service)

    if (await checkTCP(options)) {
      core.info(`Service: ${service.name} / Port: ${portNumber} / Status: 🟢`)
    } else {
      core.setFailed(`Service: ${service.name} / Port: ${portNumber} / Status: 🔴`)
    }
  }
}

function parseConfig(service: ServiceDef): CheckPortOptions {

  var options: CheckPortOptions = {
    port: 80,
    protocol: 'tcp'
  }

  // loop through the labels, if they have the prefix to the port, read the configuration.

  if (config.length === 0) {
    return options
  }

  for (const value of Object.values(config)) {
    console.log(value)
  }



  return options
}

async function checkTCP(options: CheckPortOptions): Promise<boolean> {
  const host = '127.0.0.1'




  const promise = new Promise((resolve, reject) => {
    const socket = new net.Socket()

    const onError = () => {
      socket.destroy()
      reject()
    }

    socket.setTimeout(1000)
    socket.once('error', onError)
    socket.once('timeout', onError)

    socket.connect(options.port, host, () => {
      socket.end()
      resolve(true)
    })
  })

  try {
    await promise
    return true
  } catch {
    return false
  }
}
