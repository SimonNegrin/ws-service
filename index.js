import { server as WebsocketServer } from 'websocket'
import { createServer } from 'http'
import ChannelsService from './ChannelsService.js'
import { config as loadEnv } from 'dotenv'
import log from './log.js'

loadEnv()

const port = Number(process.env.PORT) || 4321
const channelsService = new ChannelsService()

const commands = {
  sub: (connection, data) => channelsService.subscribe(connection, data.channel),
  unsub: (connection, data) => channelsService.unsubscribe(connection, data.channel),
  emit: (connection, data) => channelsService.emitFrom(connection, data.channel, data.payload)
}

const httpServer = createServer((req, res) => {
  log.info('Received request:', req.url)
  res.writeHead(404)
  res.end()
})

const wsServer = new WebsocketServer({
  httpServer,
  autoAcceptConnections: true
})

wsServer.on('connect', connection => {
  log.info('Connection accepted from:', connection.remoteAddress)
  connection.on('message', message => onMessage(connection, message))
  connection.on('close', (reasonCode, description) => onClose(connection, reasonCode, description))
})

httpServer.listen(port, () => {
  log.info(`Server is listening at port ${port}`)
})

function onMessage(connection, message) {
  if (message.type !== 'utf8') {
    return
  }
  try {
    const data = JSON.parse(message.utf8Data)
    if (!(data.type in commands)) {
      log.error('Unknown command:', data.type)
      return
    }
    commands[data.type](connection, data)
  } catch (error) {
    log.error('Error:', error)
  }
}

function onClose(connection, reasonCode, description) {
  log.info('Connection closed:', reasonCode, description)
  channelsService.unsubscribeAll(connection)
}
