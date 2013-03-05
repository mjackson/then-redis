var url = require('url');
var net = require('net');
var util = require('util');
var events = require('events');
var q = require('q');
var ReplyParser = require('./reply-parser');
var _slice = Array.prototype.slice;

module.exports = Client;

function Client(options) {
  events.EventEmitter.call(this);
  options = options || process.env.REDIS_URL || 'tcp://localhost:6379';

  if (typeof options === 'string') {
    var parsed = url.parse(options);
    options = {};
    options.auth = parsed.auth;
    options.host = parsed.hostname;
    options.port = parsed.port;
  }

  this.host = options.host || 'localhost';
  this.port = parseInt(options.port, 10) || 6379;
  this.noDelay = ('noDelay' in options) ? options.noDelay : true;
  this.returnBuffers = options.returnBuffers || false;
  this.debug = options.debug || false;
  this.stack = [];

  this.db = 0;
  if (options.auth) {
    var parsedAuth = options.auth.split(':');
    if (parsedAuth[0]) this.db = parsedAuth[0];
    if (parsedAuth[1]) this.password = parsedAuth[1];
  }

  this._setupParser();
}

util.inherits(Client, events.EventEmitter);

Client.prototype._setupParser = function () {
  var parser = new ReplyParser(this.returnBuffers);
  var self = this;

  parser.on('reply', function (reply) {
    if (isMessage(reply)) {
      self._handleMessage(reply);
    } else {
      self._handleReply(reply);
    }
  });

  parser.on('error', function (error) {
    self.emit('error', 'Parser error: ' + error.stack);
  });

  this.parser = parser;
};

Client.prototype._handleMessage = function (message) {
  this.emit.apply(this, message);
};

Client.prototype._handleReply = function (reply) {
  var isSub = isSubReply(reply);

  // (pun)subscribe can generate many replies. The first
  // one is returned. All are emitted as events.
  if (isSub) this.emit.apply(this, reply);

  var deferred = this.stack.shift();

  if (deferred) {
    if (reply && reply.constructor === Error) {
      deferred.reject(reply);
    } else {
      deferred.resolve(reply);
    }
  } else if (this.isMonitor) {
    this.emit('monitor', reply);
  } else if (!isSub) {
    this.emit('error', new Error('Unexpected reply: ' + reply));
  }
};

Client.prototype.connect = function () {
  var deferred = q.defer();
  var self = this;

  var connection = net.createConnection(this.port, this.host, function () {
    connection.setNoDelay(self.noDelay);
    connection.setTimeout(0);

    connection.on('data', function (chunk) {
      self.parser.exec(chunk);
    });

    connection.on('error', function (error) {
      self._flushError(error);
    });

    connection.on('close', function () {
      delete self.connection;
    });

    self.connection = connection;

    function afterAuth() {
      if (self.db !== 0) {
        self.select(self.db).then(deferred.resolve);
      } else {
        deferred.resolve();
      }
    }

    if (self.password) {
      self.auth(self.password).then(afterAuth);
    } else {
      afterAuth();
    }
  });

  return deferred.promise;
};

Client.prototype._flushError = function (error) {
  var deferred;
  while (deferred = this.stack.shift()) {
    deferred.reject(error);
  }
};

Client.prototype.send = function (command, args) {
  if (!this.connection) {
    var self = this;
    return this.connect().then(function () {
      return self.send(command, args);
    });
  }

  var deferred = q.defer();

  this.stack.push(deferred);
  this.connection.write(stringifyCommand(command, args));

  return deferred.promise;
};

[
  // keys
  'del', 'dump', 'exists', 'expire', 'expireat', 'keys', 'migrate', 'move',
  'object', 'persist', 'pexpire', 'pexpireat', 'pttl', 'randomkey', 'rename',
  'renamenx', 'restore', 'sort', 'ttl', 'type',
  // strings
  'append', 'bitcount', 'bitop', 'decr', 'decrby', 'get', 'getbit', 'getrange',
  'getset', 'incr', 'incrby', 'incrbyfloat', 'mget', 'mset', 'msetnx', 'psetex',
  'set', 'setbit', 'setex', 'setnx', 'setrange', 'strlen',
  // hashes
  'hdel', 'hexists', 'hget', 'hgetall', 'hincrby', 'hincrbyfloat', 'hkeys', 'hlen',
  'hmget', 'hmset', 'hset', 'hsetnx', 'hvals',
  // lists
  'blpop', 'brpop', 'brpoplpush', 'lindex', 'linsert', 'llen', 'lpop', 'lpush',
  'lpushx', 'lrange', 'lrem', 'lset', 'ltrim', 'rpop', 'rpoplpush', 'rpush', 'rpushx',
  // sets
  'sadd', 'scard', 'sdiff', 'sdiffstore', 'sinter', 'sinterstore', 'sismember',
  'smembers', 'smove', 'spop', 'srandmember', 'srem', 'sunion', 'sunionstore',
  // sorted sets
  'zadd', 'zcard', 'zcount', 'zincrby', 'zinterstore', 'zrange', 'zrangebyscore',
  'zrank', 'zrem', 'zremrangebyrank', 'zremrangebyscore', 'zrevrange', 'zrevrangebyscore',
  'zrevrank', 'zscore', 'zunionstore',
  // pubsub
  'psubscribe', 'publish', 'punsubscribe', 'subscribe', 'unsubscribe',
  // transactions
  'discard', 'exec', 'multi', 'unwatch', 'watch',
  // scripting
  'eval', 'evalsha', 'script',
  // connection
  'auth', 'echo', 'ping', 'quit', 'select',
  // server
  'bgrewriteaof', 'bgsave', 'client', 'config', 'dbsize', 'debug', 'flushall',
  'flushdb', 'info', 'lastsave', 'monitor', 'save', 'shutdown', 'slaveof',
  'slowlog', 'sync', 'time'
].forEach(function (command) {
  addCommand(command, function () {
    return this.send(command, _slice.call(arguments, 0));
  });
});

// Set the client's db property to the database number when selecting.
addCommand('select', function (db) {
  var self = this;
  return this.send('select', [ db ]).then(function (reply) {
    self.db = db;
    return reply;
  });
});

// Set the client's isMonitor property to true when monitoring.
addCommand('monitor', function () {
  var self = this;
  return this.send('monitor').then(function (reply) {
    self.isMonitor = true;
    return reply;
  });
});

function addCommand(method, handler) {
  var upperMethod = method.toUpperCase();
  Client.prototype[method] = Client.prototype[upperMethod] = handler;
}

function stringifyCommand(command, args) {
  var commandArgs = (args && args.length > 0) ? [ command ].concat(args) : [ command ];
  var string = '*' + commandArgs.length + '\r\n';

  var arg;
  for (var i = 0, len = commandArgs.length; i < len; ++i) {
    arg = String(commandArgs[i]);
    string += '$' + Buffer.byteLength(arg) + '\r\n' + arg + '\r\n';
  }

  return string;
}

var messageTypes = { message: true, pmessage: true };
function isMessage(reply) {
  return Array.isArray(reply) && messageTypes[reply[0]];
}

var subReplyTypes = { subscribe: true, unsubscribe: true, psubscribe: true, punsubscribe: true };
function isSubReply(reply) {
  return Array.isArray(reply) && subReplyTypes[reply[0]];
}
