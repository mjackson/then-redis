import { EventEmitter } from 'events'
import RedisCommands from 'redis-commands'
import redis from 'redis'
import {
  appendHashToArray,
  parseInfo
} from './RedisUtils'

const ClientProperties = [
  // redis properties, forwarded read-only.
  'connection_id',
  'connected',
  'ready',
  'connections',
  'options',
  'pub_sub_mode',
  'selected_db'
]

const ConnectionEvents = [
  'ready',
  'connect',
  'reconnecting',
  'error',
  'end'
]

const MonitorEvents = [
  'monitor'
]

const PubSubEvents = [
  'message',
  'pmessage',
  'subscribe',
  'psubscribe',
  'unsubscribe',
  'punsubscribe'
]

const AllEvents = [
  ...ConnectionEvents,
  ...MonitorEvents,
  ...PubSubEvents
]

/**
 * A Redis client that returns promises for all operations.
 */
class Client extends EventEmitter {

  /**
   * Supports exactly the same parameters as node_redis
   */
  constructor(...args) {
    super()

    const redisClient = redis.createClient(...args)

    AllEvents.forEach((eventName) => {
      redisClient.on(eventName, this.emit.bind(this, eventName))
    }, this)

    this._redisClient = redisClient
  }

  unref() {
    this._redisClient.unref()
  }

  send(command, args = []) {
    return new Promise((resolve, reject) => {
      this._redisClient.send_command(command, args, (error, value) => {
        if (error) {
          reject(error)
        } else {
          resolve(value)
        }
      })
    })
  }

  // Update the selected_db property of the client on SELECT.
  select(db) {
    return new Promise((resolve, reject) => {
      // Need to use this so selected_db updates properly.
      this._redisClient.select(db, (error, value) => {
        if (error) {
          reject(error)
        } else {
          resolve(value)
        }
      })
    })
  }

  // Parse the result of INFO.
  info() {
    return this.send('info').then(parseInfo)
  }

  // Optionally accept an array as the first argument to LPUSH after the key.
  lpush(key, ...values) {
    const args = [ key ].concat(Array.isArray(values[0]) ? values[0] : values)
    return this.send('lpush', args)
  }

  // Optionally accept an array as the first argument to RPUSH after the key.
  rpush(key, ...values) {
    const args = [ key ].concat(Array.isArray(values[0]) ? values[0] : values)
    return this.send('rpush', args)
  }

  // Optionally accept an array as the only argument to DEL.
  del(...keys) {
    const args = Array.isArray(keys[0]) ? keys[0] : keys
    return this.send('del', args)
  }

  // Optionally accept an array as the only argument to MGET.
  mget(...keys) {
    const args = Array.isArray(keys[0]) ? keys[0] : keys
    return this.send('mget', args)
  }

  // Optionally accept a hash as the only argument to MSET.
  mset(...keysAndValues) {
    const args = (typeof keysAndValues[0] === 'object')
      ? appendHashToArray(keysAndValues[0], [])
      : keysAndValues

    return this.send('mset', args)
  }

  // Optionally accept a hash as the only argument to MSETNX.
  msetnx(...keysAndValues) {
    const args = (typeof keysAndValues[0] === 'object')
      ? appendHashToArray(keysAndValues[0], [])
      : keysAndValues

    return this.send('msetnx', args)
  }

  // Optionally accept a hash as the first argument to HMSET after the key.
  hmset(key, ...keysAndValues) {
    const args = (typeof keysAndValues[0] === 'object')
      ? appendHashToArray(keysAndValues[0], [ key ])
      : [ key ].concat(keysAndValues)

    return this.send('hmset', args)
  }

}

ClientProperties.forEach((propertyName) => {
  Object.defineProperty(Client.prototype, propertyName, {
    configurable: true,
    enumerable: false,
    get() {
      return this._redisClient[propertyName]
    }
  })
})

RedisCommands.list.forEach((command) => {
  // Some commands have spaces in them, like CONFIG SET.
  const methodName = command.split(' ')[0]

  if (methodName in Client.prototype)
    return

  Object.defineProperty(Client.prototype, methodName, {
    configurable: true,
    enumerable: false,
    writable: true,
    value(...args) {
      return this.send(command, args)
    }
  })
})

module.exports = Client
