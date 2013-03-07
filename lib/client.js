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
  this.timeout = options.timeout || 0;
  this.returnBuffers = options.returnBuffers || false;

  this._values = [];
  this._writes = [];
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

  var value = this._values.shift();

  if (value) {
    if (reply && reply.constructor === Error) {
      value.reject(reply);
    } else {
      value.resolve(reply);
    }
  } else if (this.isMonitor) {
    this.emit('monitor', reply);
  } else if (!isSub) {
    this.emit('error', new Error('Unexpected reply: ' + reply));
  }
};

Client.prototype._flushError = function (error) {
  var value;
  while (value = this._values.shift()) {
    value.reject(error);
  }
};

Client.prototype._flushPendingWrites = function () {
  var write;
  while (write = this._writes.shift()) {
    this.connection.write(write);
  }
};

// Connects to Redis. Returns the result of AUTH and SELECT.
// If neither are needed, this value will always be ["OK", "OK"].
Client.prototype.connect = function () {
  if (!this._connectValue) {
    this._connectValue = q.defer();

    var connection = net.createConnection(this.port, this.host);
    connection.setNoDelay(this.noDelay);
    connection.setTimeout(this.timeout);

    var self = this;

    connection.on('connect', function () {
      self.connection = connection;

      // Automatically to AUTH and SELECT first, if needed.
      var authValue = self.password ? self.auth(self.password) : 'OK';
      var selectValue = self.database ? self.select(self.database) : 'OK';

      self._flushPendingWrites();
      self._connectValue.resolve(q.all([ authValue, selectValue ]));
    });

    connection.on('error', function (error) {
      if (self.connection) self._flushError(error);
      self._connectValue.reject(error);
    });

    connection.on('data', function (chunk) {
      self.parser.exec(chunk);
    });

    connection.on('close', function () {
      delete self._connectValue;
      delete self.connection;
      self.emit('close');
    });
  }

  return this._connectValue.promise;
};

Client.prototype.send = function (command, args, dontBuffer) {
  var numArgs = args ? args.length : 0;
  var write = '*' + (1 + numArgs) + '\r\n';

  write += '$' + Buffer.byteLength(command) + '\r\n' + command + '\r\n';

  if (numArgs) {
    var arg;
    for (var i = 0; i < numArgs; ++i) {
      arg = String(args[i]);
      write += '$' + Buffer.byteLength(arg) + '\r\n' + arg + '\r\n';
    }
  }

  var value = q.defer();
  this._values.push(value);

  if (this.connection) {
    this.connection.write(write);
  } else {
    // Buffer the write and connect.
    this._writes.push(write);
    this.connect();
  }

  return value.promise;
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
