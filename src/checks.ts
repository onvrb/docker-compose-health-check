import * as core from '@actions/core'
import {stringify, Tree} from 'dot-properties'
import net from 'node:net'

export interface ServiceDef {
  name: string
  ports: PortDef[]
}
export interface PortDef {
  port: number
  config: Tree
}

type ConfigNode = Tree | string

export default async function checkServices(service: ServiceDef) {
  for (const portConfig of service.ports) {
    const port = String(portConfig.port)
    const config = typeof portConfig.config === 'object' ? portConfig.config : ({} as Tree)

    const dchc = typeof config['dchc'] === 'object' ? (config['dchc'] as Tree) : ({} as Tree)
    const dchcPort = typeof dchc['port'] === 'object' ? (dchc['port'] as Tree) : ({} as Tree)
    const mainConfig = typeof dchcPort[port] === 'object' ? (dchcPort[port] as Tree) : ({} as Tree)
    const protocol = typeof mainConfig['protocol'] === 'string' ? mainConfig['protocol'] : 'tcp'
    const protocolConfig = (mainConfig[protocol] ?? {}) as Tree

    let retCheck = false
    switch (protocol) {
      default:
        retCheck = await checkTCP(port, mainConfig)
        break
    }

    if (retCheck) {
      core.info(`Service: ${service.name} / Port: ${port} / Status: 🟢`)
    } else {
      core.setFailed(`Service: ${service.name} / Port: ${port} / Status: 🔴`)
    }
  }
}

async function delay(ms: number) {
  await new Promise(resolve => setTimeout(() => resolve(true), ms)).then(() => {})
}

async function checkTCP(port: string, options: Tree) {
  const host = '127.0.0.1'
  const portNumber = Number(port)
  const timeout = isNaN(Number(options['timeout'])) ? 1000 : Number(options['timeout'])
  const retries = isNaN(Number(options['retries'])) ? 5 : Number(options['retries'])
  const interval = isNaN(Number(options['interval'])) ? 1000 : Number(options['interval'])

  for (let r = 0; r < retries; r++) {
    const promise = new Promise((resolve, reject) => {
      const socket = new net.Socket()

      const onError = () => {
        socket.destroy()
        reject()
      }

      socket.setTimeout(timeout)
      socket.once('error', onError)
      socket.once('timeout', onError)

      socket.once('connect', () => {
        socket.destroy()
        resolve(true)
      })

      socket.connect(portNumber, host)
    })

    try {
      await promise
      return true
    } catch {
      await delay(interval)
    }
  }
  return false
}
