var url = require('url');
var net = require('net');
var util = require('util');
var events = require('events');
var q = require('q');
var ReplyParser = require('./reply-parser');

module.exports = Client;

function Client(options) {
  events.EventEmitter.call(this);
  options = options || process.env.REDIS_URL || 'tcp://localhost:6379';

  if (typeof options === 'string') {
    var parsed = url.parse(options);
    options = {};
    options.host = parsed.hostname;
    options.port = parsed.port;
    if (parsed.auth) {
      var split = parsed.auth.split(':');
      if (split[0]) options.database = split[0];
      if (split[1]) options.password = split[1];
    }
  }

  this.host = options.host || 'localhost';
  this.port = parseInt(options.port, 10) || 6379;
  this.database = parseInt(options.database, 10) || 0;
  this.password = options.password;
  this.noDelay = ('noDelay' in options) ? options.noDelay : true;
  this.returnBuffers = options.returnBuffers || false;

  this.stack = [];

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
    self.connection = connection;

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
      self.emit('close');
    });

    function afterAuth() {
      if (self.database !== 0) {
        self.select(self.database).then(deferred.resolve);
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

  var string = '$' + Buffer.byteLength(command) + '\r\n' + command + '\r\n';
  var numArgs = args ? args.length : 0;

  if (numArgs) {
    var arg;
    for (var i = 0; i < numArgs; ++i) {
      arg = String(args[i]);
      string += '$' + Buffer.byteLength(arg) + '\r\n' + arg + '\r\n';
    }
  }

  this.connection.write('*' + (1 + numArgs) + '\r\n' + string);

  return deferred.promise;
};

var messageTypes = { message: true, pmessage: true };
function isMessage(reply) {
  return Array.isArray(reply) && messageTypes[reply[0]];
}

var subReplyTypes = { subscribe: true, unsubscribe: true, psubscribe: true, punsubscribe: true };
function isSubReply(reply) {
  return Array.isArray(reply) && subReplyTypes[reply[0]];
}

// Add commands to the Client prototype for convenience.
var proto = Client.prototype;
var commands = require('./commands');
for (var command in commands) {
  proto[command] = proto[command.toUpperCase()] = commands[command];
}
