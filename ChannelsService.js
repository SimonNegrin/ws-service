
export default class ChannelsService {

  #channels = new Map()
  #connections = new Map()

  subscribe(connection, channels) {
    channels.forEach(channel => {
      if (!this.#channels.has(channel)) {
        this.#channels.set(channel, new Set())
      }
      this.#channels.get(channel).add(connection)
      if (!this.#connections.has(connection)) {
        this.#connections.set(connection, new Set())
      }
      this.#connections.get(connection).add(channel)
    })
  }

  unsubscribe(connection, channels) {
    channels.forEach(channel => {
      if (this.#channels.has(channel)) {
        this.#channels.get(channel).delete(connection)
        this.#clearChannelIfEmpty(channel)
      }
      if (this.#connections.has(connection)) {
        this.#connections.get(connection).delete(channel)
      }
    })
  }

  unsubscribeAll(connection) {
    if (!this.#connections.has(connection)) {
      return
    }
    this.#connections.get(connection).forEach(channel => {
      this.#channels.get(channel).delete(connection)
      this.#clearChannelIfEmpty(channel)
    })
    this.#connections.delete(connection)
  }

  emitFrom(connection, channels, payload) {
    const message = JSON.stringify({ type: 'emit', payload })
    channels.forEach(channel => {
      if (!this.#channels.has(channel)) {
        return
      }
      this.#channels.get(channel).forEach(subscriber => {
        if (subscriber !== connection) {
          subscriber.sendUTF(message)
        }
      })
    })
  }

  #clearChannelIfEmpty(channel) {
    if (this.#channels.get(channel)?.size === 0) {
      this.#channels.delete(channel)
    }
  }

}
