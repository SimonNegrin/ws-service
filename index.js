import { server as WebsocketServer } from 'websocket'
import { createServer } from 'http'

const httpServer = createServer((req, res) => {
  info('Received request:', req.url)
  res.writeHead(404);
  res.end();
})

const wsServer = new WebsocketServer({
  httpServer,
  autoAcceptConnections: true
})

wsServer.on('connect', connection => {
  connection.on('message', message => {
    if (message.type === 'utf8') {
      info('Received Message:', message.utf8Data)
      connection.sendUTF(message.utf8Data)
    }
  })
  connection.on('close', (reasonCode, description) => {
    info('Connection closed:', reasonCode, description)
  })
})

httpServer.listen(8080, () => {
  info('Server is listening on port 8080')
})

function info(...messages) {
  const dateTime = new Date().toISOString()
  console.log(`[${dateTime}]`, ...messages)
}
