import url from 'url'
import { EventEmitter } from 'events'
import d from 'describe-property'
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
  'end',
  'drain',
  'idle'
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
 * A small Redis client that returns promises for all operations.
 *
 * Supported options are:
 *
 * - port             The TCP port to use (defaults to 6379)
 * - host             The hostname of the Redis host (defaults to 127.0.0.1)
 * - database         The database # to use (defaults to 0)
 * - password         The password to use for AUTH
 * - returnBuffers    True to return buffers (defaults to false)
 */
function Client(options) {
  EventEmitter.call(this)

  options = options || process.env.REDIS_URL || 'tcp://127.0.0.1:6379'

  if (typeof options === 'string') {
    let parsed = url.parse(options)

    options = {}
    options.host = parsed.hostname
    options.port = parsed.port

    if (parsed.auth) {
      let split = parsed.auth.split(':')

      if (split[0] && !isNaN(split[0]))
        options.database = split[0]

      if (split[1])
        options.password = split[1]
    }
  }

  this.port = parseInt(options.port, 10) || 6379
  this.host = options.host || '127.0.0.1'

  if (options.password)
    options.auth_pass = options.password

  if (options.returnBuffers)
    options.return_buffers = true

  const redisClient = redis.createClient(this.port, this.host, options)

  AllEvents.forEach((eventName) => {
    redisClient.on(eventName, this.emit.bind(this, eventName))
  }, this)

  this._redisClient = redisClient

  if (options.database)
    this.select(options.database)
}

require('util').inherits(Client, EventEmitter)

Client.prototype.send = function (command, args) {
  const client = this._redisClient

  return new Promise((resolve, reject) => {
    client.send_command(command, args || [], (error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(value)
      }
    })
  })
}

const slice = Array.prototype.slice

Object.defineProperties(Client.prototype, {

  // Parse the result of INFO.
  info: d(function () {
    return this.send('info').then(parseInfo)
  }),

  // Optionally accept an array as the only argument to MGET.
  mget: d(function (keys) {
    const args = Array.isArray(keys) ? keys : slice.call(arguments, 0)
    return this.send('mget', args)
  }),

  // Optionally accept a hash as the only argument to MSET.
  mset: d(function (hash) {
    const args = (typeof hash === 'object') ? appendHashToArray(hash, []) : slice.call(arguments, 0)
    return this.send('mset', args)
  }),

  // Optionally accept a hash as the only argument to MSETNX.
  msetnx: d(function (hash) {
    const args = (typeof hash === 'object') ? appendHashToArray(hash, []) : slice.call(arguments, 0)
    return this.send('msetnx', args)
  }),

  // Optionally accept a hash as the first argument to HMSET after the key.
  hmset: d(function (key, hash) {
    const args = (typeof hash === 'object') ? appendHashToArray(hash, [ key ]) : slice.call(arguments, 0)
    return this.send('hmset', args)
  }),

  // Update the selected_db property of the client on SELECT.
  select: d(function (db) {
    let client = this._redisClient

    return new Promise((resolve, reject) => {
      // Need to use this so selected_db updates properly.
      client.select(db, (error, value) => {
        if (error) {
          reject(error)
        } else {
          resolve(value)
        }
      })
    })
  }),

  // Optionally accept an array as the only argument to DEL.
  del: d(function (keys) {
    const args = Array.isArray(keys) ? keys : slice.call(arguments, 0)
    return this.send('del', args)
  })

});

// Optionally accept an array as the first argument to LPUSH and RPUSH after the key.
[ 'lpush', 'rpush' ].forEach((command) => {
  Object.defineProperty(Client.prototype, command, d(function (key, array) {
    let args = Array.isArray(array) ? [ key ].concat(array) : slice.call(arguments, 0)
    return this.send(command, args)
  }))
})

ClientProperties.forEach((propertyName) => {
  Object.defineProperty(Client.prototype, propertyName, d.gs(function () {
    return this._redisClient[propertyName]
  }))
})

RedisCommands.list.forEach((command) => {
  // Some commands have spaces in them, like CONFIG SET.
  command = command.split(' ')[0]

  if (command in Client.prototype)
    return

  Object.defineProperty(Client.prototype, command, d(function (...args) {
    return this.send(command, args)
  }))
})

module.exports = Client
