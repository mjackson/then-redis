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
  this.deferreds = [];

  this.db = 0;
  if (options.auth) {
    var parsedAuth = options.auth.split(':');
    if (parsedAuth[0]) this.db = parsedAuth[0];
    if (parsedAuth[1]) this.password = parsedAuth[1];
  }

  this._setupParser();
}

Client.prototype._setupParser = function () {
  var self = this;
  var parser = new ReplyParser(this.returnBuffers);

  parser.on('reply', function (reply) {
    if (typeof self._replyHandler === 'function') {
      self._replyHandler(reply);
    } else {
      var deferred = self.deferreds.shift();
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

  this.deferreds.push(deferred);
  this.connection.write(payload);

  return deferred.promise;
};

Client.prototype.stream = function (command, args) {
  var replyHandler = args.pop();

  if (typeof replyHandler !== 'function') {
    throw new Error('Last argument to ' + command + ' must be a callback');
  }

  this._replyHandler = replyHandler;

  return this.send(command, args);
};

Client.prototype.SELECT = select;
Client.prototype.select = select;
function select(db) {
  var self = this;
  return this.send('select', [ db ]).then(function (reply) {
    self.db = db;
    return reply;
  });
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
  'publish', 'punsubscribe', 'unsubscribe',
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

var streamCommands = [
  // pubsub
  'psubscribe', 'subscribe',
  // server
  'monitor'
];

streamCommands.forEach(function (command) {
  var upperCommand = command.toUpperCase();
  Client.prototype[command] = Client.prototype[upperCommand] = function () {
    var args = _slice.call(arguments, 0);
    return this.stream(command, args);
  };
});
