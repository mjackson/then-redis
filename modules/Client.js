var url = require('url');
var redis = require('redis');
var EventEmitter = require('events').EventEmitter;
var appendHashToArray = require('./utils/appendHashToArray');
var parseInfo = require('./utils/parseInfo');
var Promise = require('./utils/Promise');

var PROPERTIES = [
  // redis properties, forwarded read-only.
  'connection_id',
  'connected',
  'ready',
  'connections',
  'options',
  'pub_sub_mode',
  'selected_db'
];

var EVENTS = [
  // Connection events.
  'ready',
  'connect',
  'reconnecting',
  'error',
  'end',
  'drain',
  'idle',

  // Monitor events.
  'monitor',

  // Pubsub events.
  'message',
  'pmessage',
  'subscribe',
  'psubscribe',
  'unsubscribe',
  'punsubscribe'
];

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
 *
 * Example:
 *
 *   var redis = require('then-redis');
 *   var db = redis.createClient('tcp://127.0.0.1:6379');
 *
 *   var promise = db.set('a-key', 'my value').then(function () {
 *     return db.get('a-key');
 *   });
 *
 *   promise.then(function (value) {
 *     assert.equal(value, 'my value');
 *   });
 */
function Client(options) {
  EventEmitter.call(this);

  options = options || process.env.REDIS_URL || 'tcp://127.0.0.1:6379';

  if (typeof options === 'string') {
    var parsed = url.parse(options);

    options = {};
    options.host = parsed.hostname;
    options.port = parsed.port;

    if (parsed.auth) {
      var split = parsed.auth.split(':');

      if (split[0])
        options.database = split[0];

      if (split[1])
        options.password = split[1];
    }
  }

  this.port = parseInt(options.port, 10) || 6379;
  this.host = options.host || '127.0.0.1';

  if (options.password)
    options.auth_pass = options.password;

  if (options.returnBuffers)
    options.return_buffers = true;

  var redisClient = redis.createClient(this.port, this.host, options);

  EVENTS.forEach(function (eventName) {
    redisClient.on(eventName, this.emit.bind(this, eventName));
  }, this);

  this._redisClient = redisClient;

  if (options.database)
    this.select(options.database);
}

require('util').inherits(Client, EventEmitter);

Client.prototype.send = function (command, args) {
  var client = this._redisClient;

  return new Promise(function (resolve, reject) {
    client.send_command(command, args || [], function (error, value) {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
};

var slice = Array.prototype.slice;

Object.defineProperties(Client.prototype, {

  // Parse the result of INFO.
  info: {
    value: function () {
      return this.send('info').then(parseInfo);
    }
  },

  // Optionally accept a hash as the only argument to MSET.
  mset: {
    value: function (hash) {
      var args = (typeof hash === 'object') ? appendHashToArray(hash, []) : slice.call(arguments, 0);
      return this.send('mset', args);
    }
  },

  // Optionally accept a hash as the only argument to MSETNX.
  msetnx: {
    value: function (hash) {
      var args = (typeof hash === 'object') ? appendHashToArray(hash, []) : slice.call(arguments, 0);
      return this.send('msetnx', args);
    }
  },

  // Optionally accept a hash as the first argument to HMSET after the key.
  hmset: {
    value: function (key, hash) {
      var args = (typeof hash === 'object') ? appendHashToArray(hash, [ key ]) : slice.call(arguments, 0);
      return this.send('hmset', args);
    }
  },

  // Update the selected_db property of the client on SELECT.
  select: {
    value: function (db) {
      var client = this._redisClient;

      return new Promise(function (resolve, reject) {
        // Need to use this so selected_db updates properly.
        client.select(db, function (error, value) {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      });
    }
  }

});

PROPERTIES.forEach(function (propertyName) {
  Object.defineProperty(Client.prototype, propertyName, {
    get: function () {
      return this._redisClient[propertyName];
    }
  });
});

require('redis/lib/commands').forEach(function (command) {
  // Some commands have spaces in them, like CONFIG SET.
  command = command.split(' ')[0];

  if (command in Client.prototype)
    return;

  Object.defineProperty(Client.prototype, command, {
    value: function () {
      return this.send(command, slice.call(arguments, 0));
    }
  });
});

module.exports = Client;
