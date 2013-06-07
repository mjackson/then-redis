var url = require('url');
var net = require('net');
var util = require('util');
var events = require('events');
var when = require('when');
var ReplyParser = require('./reply-parser');

module.exports = Client;

function Client(options) {
  events.EventEmitter.call(this);
  options = options || process.env.REDIS_URL || 'tcp://127.0.0.1:6379';

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

  this.host = options.host || '127.0.0.1';
  this.port = parseInt(options.port, 10) || 6379;
  this.database = parseInt(options.database, 10) || 0;
  this.password = options.password;
  this.noDelay = ('noDelay' in options) ? options.noDelay : true;
  this.timeout = options.timeout || 0;
  this.returnBuffers = options.returnBuffers || false;

  this._commandValues = [];
  this._pendingWrites = [];
  this._setupParser();
}

util.inherits(Client, events.EventEmitter);

Client.prototype._setupParser = function () {
  var parser = new ReplyParser(this.returnBuffers);
  var self = this;

  parser.on('reply', function (reply) {
    self._handleReply(reply);
  });

  parser.on('error', function (error) {
    self.emit('error', new Error('Parser error: ' + error.stack));
  });

  this.parser = parser;
};

Client.prototype._handleReply = function (reply) {
  if (isMessageReply(reply)) {
    this.emit.apply(this, reply);
    return;
  }

  var value = this._commandValues.shift();

  if (value) {
    if (this.returnBuffers) {
      value.resolve(reply);
      return;
    }

    if (reply && reply.constructor === Error) {
      value.reject(reply);
    } else {
      value.resolve(reply);
    }

    // (pun)subscribe can generate many replies. The first
    // one is returned. All are emitted as events.
    if (isSubReply(reply)) {
      this.emit.apply(this, reply);
    }
  } else if (isSubReply(reply)) {
    this.emit.apply(this, reply);
  } else if (this.isMonitor) {
    this.emit('monitor', reply);
  } else {
    this.emit('error', new Error('Unexpected reply: ' + reply));
  }
};

Client.prototype._flushError = function (error) {
  var value;
  while (value = this._commandValues.shift()) {
    value.reject(error);
  }
};

Client.prototype._flushPendingWrites = function () {
  var value;
  while (value = this._pendingWrites.shift()) {
    this._write(value, this._pendingWrites.shift());
  }
};

Client.prototype._write = function (value, write) {
  this._commandValues.push(value);
  this.connection.write(write);
};

// Connects to Redis. Returns the result of AUTH and SELECT.
// If neither are needed, this value will always be ["OK", "OK"].
Client.prototype.connect = function () {
  if (!this._connectValue) {
    this._connectValue = when.defer();

    var connection = net.createConnection(this.port, this.host);
    connection.setNoDelay(this.noDelay);
    connection.setTimeout(this.timeout);

    var self = this;

    connection.on('connect', function () {
      self.connection = connection;

      // Write AUTH and SELECT before flushing pending writes, if needed.
      var authValue = self.password ? self.auth(self.password) : 'OK';
      var selectValue = self.database ? self.select(self.database) : 'OK';
      self._flushPendingWrites();

      self._connectValue.resolve(when.all([ authValue, selectValue ]));
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

// Issues the given Redis command to the server with the given arguments
// and returns a promise for the reply.
Client.prototype.send = function (command, args) {
  var value = when.defer();
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

  write = new Buffer(write);

  if (this.connection) {
    this._write(value, write);
  } else {
    this._pendingWrites.push(value, write);
    this.connect(); // Automatically connect.
  }

  return value.promise;
};

// Add all Redis commands to the Client prototype for convenience.
var commands = require('./commands');
for (var command in commands) {
  Client.prototype[command] = commands[command];
}

/* helpers */

var messageTypes = { message: true, pmessage: true };
function isMessageReply(reply) {
  return reply && messageTypes[reply[0]];
}

var subReplyTypes = { subscribe: true, unsubscribe: true, psubscribe: true, punsubscribe: true };
function isSubReply(reply) {
  return reply && subReplyTypes[reply[0]];
}
