var url = require('url');
var net = require('net');
var q = require('q');
var ReplyParser = require('./reply-parser');
var _slice = Array.prototype.slice;

module.exports = Client;

function Client(options) {
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
  this.returnBuffers = options.returnBuffers || false;
  this.db = 0;
  this.stack = [];

  this._setupParser();

  if (options.auth) {
    var parsedAuth = options.auth.split(':');
    if (parsedAuth[0]) this.db = parsedAuth[0];
    if (parsedAuth[1]) this.password = parsedAuth[1];
  }
}

Client.prototype._setupParser = function () {
  var self = this;
  var parser = new ReplyParser(this.returnBuffers);

  parser.on('reply', function (reply) {
    if (typeof self._replyHandler === 'function') {
      self._replyHandler(reply);
    } else {
      var deferred = self.stack.shift();

      if (reply && reply.constructor === Error) {
        deferred.reject(reply);
      } else {
        deferred.resolve(reply);
      }
    }
  });

  // The parser encountered an error, make a new one.
  parser.on('error', function () {
    self._setupParser();
  });

  this.parser = parser;
};

Client.prototype.connect = function () {
  var deferred = q.defer();

  var self = this;
  var connection = net.createConnection(this.port, this.host, function () {
    connection.setNoDelay();
    connection.setTimeout(0);

    connection.on('data', function (chunk) {
      self.parser.exec(chunk);
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
      self.send('auth', [ self.password ]).then(afterAuth);
    } else {
      afterAuth();
    }
  });

  return deferred.promise;
};

Client.prototype.send = function (command, args) {
  if (!this.connection) {
    var self = this;
    return this.connect().then(function () {
      return self.send(command, args);
    });
  }

  args = args || [];

  var payloadArgs = [ command ].concat(args);
  var payload = '*' + payloadArgs.length + '\r\n';

  var arg;
  for (var i = 0, len = payloadArgs.length; i < len; ++i) {
    arg = String(payloadArgs[i]);
    payload += '$' + Buffer.byteLength(arg) + '\r\n' + arg + '\r\n';
  }

  var deferred = q.defer();

  this.stack.push(deferred);
  this.connection.write(payload);

  return deferred.promise;
};

Client.prototype.SELECT = select;
Client.prototype.select = select;
function select(db) {
  var self = this;
  return this.send('select', [ db ]).then(function (response) {
    self.db = db;
    return response;
  });
}

Client.prototype.PSUBSCRIBE = psubscribe;
Client.prototype.psubscribe = psubscribe;
function psubscribe() {
  var patterns = _slice.call(arguments, 0);
  var replyHandler = patterns.pop();

  if (typeof replyHandler !== 'function') {
    throw new Error('Last argument to subscribe must be a callback');
  }

  this._replyHandler = replyHandler;

  return this.send('psubscribe', patterns);
}

Client.prototype.SUBSCRIBE = subscribe;
Client.prototype.subscribe = subscribe;
function subscribe() {
  var channels = _slice.call(arguments, 0);
  var replyHandler = patterns.pop();

  if (typeof replyHandler !== 'function') {
    throw new Error('Last argument to subscribe must be a callback');
  }

  this._replyHandler = replyHandler;

  return this.send('subscribe', channels);
}

Client.prototype.MONITOR = monitor;
Client.prototype.monitor = monitor;
function monitor(replyHandler) {
  if (typeof replyHandler !== 'function') {
    throw new Error('Only argument to monitor must be a callback');
  }

  this._replyHandler = replyHandler;

  return this.send('monitor');
}

var sendCommands = [
  // keys
  'del', 'dump', 'exists', 'expire', 'expireat', 'keys', 'migrate', 'move',
  'object', 'persist', 'pexpire', 'pexpireat', 'pttl', 'randomkey', 'rename',
  'renamenx', 'restore', 'sort', 'ttl', 'type',

  // strings
  'append', 'bitcount', 'bitop', 'decr', 'decrby', 'get', 'getbit', 'getrange',
  'getset', 'incr', 'incrby', 'incrbyfloat', 'mget', 'mset', 'msetnx', 'psetex',
  'set', 'setbit', 'setex', 'setnx', 'setrange', 'strlen',

  // pubsub
  'psubscribe', 'publish', 'punsubscribe', 'subscribe', 'unsubscribe',

  // server
  'flushdb'
];

sendCommands.forEach(function (command) {
  var upperCommand = command.toUpperCase();
  Client.prototype[command] = Client.prototype[upperCommand] = function () {
    var args = _slice.call(arguments, 0);
    return this.send(command, args);
  };
});
