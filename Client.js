var url = require('url');
var redis = require('redis');
var d = require('describe-property');
var EventEmitter = require('events').EventEmitter;
var appendHashToArray = require('./utils/appendHashToArray');
var parseInfo = require('./utils/parseInfo');
var Promise = require('./utils/Promise');
var net = require('net');

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
function Client(arg0, arg1, options) {
  EventEmitter.call(this);

  if(typeof arg0 === 'object' && !(arg0 instanceof net.Socket)) {
    arg0.auth_pass = arg0.password || null;
    arg0.return_buffers = arg0.return_buffers || false;
    
    if(arg0.hasOwnProperty('host')) {
      options = arg0;
      arg0 = options.port || 6379;
      arg1 = options.host;
    }
  }

  
  var redisClient = redis.createClient(arg0, arg1, options);

  EVENTS.forEach(function (eventName) {
    redisClient.on(eventName, this.emit.bind(this, eventName));
  }, this);

  this._redisClient = redisClient;
  
  if (options && options.database)
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
  info: d(function () {
    return this.send('info').then(parseInfo);
  }),

  // Optionally accept an array as the only argument to MGET.
  mget: d(function (keys) {
    var args = Array.isArray(keys) ? keys : slice.call(arguments, 0);
    return this.send('mget', args);
  }),

  // Optionally accept a hash as the only argument to MSET.
  mset: d(function (hash) {
    var args = (typeof hash === 'object') ? appendHashToArray(hash, []) : slice.call(arguments, 0);
    return this.send('mset', args);
  }),

  // Optionally accept a hash as the only argument to MSETNX.
  msetnx: d(function (hash) {
    var args = (typeof hash === 'object') ? appendHashToArray(hash, []) : slice.call(arguments, 0);
    return this.send('msetnx', args);
  }),

  // Optionally accept a hash as the first argument to HMSET after the key.
  hmset: d(function (key, hash) {
    var args = (typeof hash === 'object') ? appendHashToArray(hash, [ key ]) : slice.call(arguments, 0);
    return this.send('hmset', args);
  }),

  // Update the selected_db property of the client on SELECT.
  select: d(function (db) {
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
  }),

  // Optionally accept an array as the only argument to DEL.
  del: d(function (keys) {
    var args = Array.isArray(keys) ? keys : slice.call(arguments, 0);
    return this.send('del', args);
  })

});

// Optionally accept an array as the first argument to LPUSH and RPUSH after the key.
[ 'lpush', 'rpush' ].forEach(function (command) {
  Object.defineProperty(Client.prototype, command, d(function (key, array) {
    var args = Array.isArray(array) ? [ key ].concat(array) : slice.call(arguments, 0);
    return this.send(command, args);
  }));
});

PROPERTIES.forEach(function (propertyName) {
  Object.defineProperty(Client.prototype, propertyName, d.gs(function () {
    return this._redisClient[propertyName];
  }));
});

require('redis/lib/commands').forEach(function (command) {
  // Some commands have spaces in them, like CONFIG SET.
  command = command.split(' ')[0];

  if (command in Client.prototype)
    return;

  Object.defineProperty(Client.prototype, command, d(function () {
    return this.send(command, slice.call(arguments, 0));
  }));
});

module.exports = Client;
