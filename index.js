import { server as WebsocketServer } from 'websocket'
import { createServer } from 'http'
import chalk from 'chalk'
import ChannelsService from './ChannelsService.js'
import { config as loadEnv } from 'dotenv'

loadEnv()

const port = Number(process.env.PORT) || 4312
const channelsService = new ChannelsService()

const httpServer = createServer((req, res) => {
  logInfo('Received request:', req.url)
  res.writeHead(404)
  res.end()
})

const wsServer = new WebsocketServer({
  httpServer,
  autoAcceptConnections: true
})

wsServer.on('connect', connection => {
  logInfo('Connection accepted')
  connection.on('message', message => onMessage(connection, message))
  connection.on('close', (reasonCode, description) => onClose(connection, reasonCode, description))
})

httpServer.listen(port, () => {
  logInfo(`Server is listening on port ${port}`)
})

function onMessage(connection, message) {
  if (message.type !== 'utf8') {
    return
  }
  logInfo('Received Message:', message.utf8Data)
  try {
    const data = JSON.parse(message.utf8Data)
    switch (data.type) {
      case 'subscribe':
        channelsService.subscribe(connection, data.channels)
        break
      case 'unsubscribe':
        channelsService.unsubscribe(connection, data.channels)
        break
      case 'emit':
        channelsService.emitFrom(connection, data.channels, data.payload)
        break
    }
  } catch (error) {
    logError('Error:', error)
  }
}

function onClose(connection, reasonCode, description) {
  logInfo('Connection closed:', reasonCode, description)
  channelsService.unsubscribeAll(connection)
}

function logInfo(...messages) {
  log(chalk.cyan(...messages))
}

function logError(...messages) {
  log(chalk.red(...messages))
}

function log(...messages) {
  const dateTime = new Date().toISOString()
  console.log(chalk.gray(`[${dateTime}]`), ...messages)
}
