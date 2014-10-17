var url = require('url');
var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var ReplyParser = require('./reply-parser');

function defer() {
  var resolve, reject;
  var promise = new Promise(function() {
    resolve = arguments[0];
    reject = arguments[1];
  });
  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  };
}

var DEFAULT_URL = 'tcp://127.0.0.1:6379';

module.exports = Client;

/**
 * A small Redis client that returns promises for all operations.
 *
 * Example:
 *
 *   var promise = db.set('a-key', 'my value').then(function (value) {
 *     return db.get('a-key');
 *   });
 *
 *   promise.then(function (value) {
 *     assert.equal(value, 'my value');
 *   });
 */
function Client(options) {
  EventEmitter.call(this);

  options = options || process.env.REDIS_URL || DEFAULT_URL;

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

util.inherits(Client, EventEmitter);

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
  if (_isMessageReply(reply))
    return this.emit.apply(this, reply);

  var value = this._commandValues.shift();

  if (value) {
    if (this.returnBuffers)
      return value.resolve(reply);

    if (reply && reply.constructor === Error) {
      value.reject(reply);
    } else {
      value.resolve(reply);
    }

    // (pun)subscribe can generate many replies. The first
    // one is returned. All are emitted as events.
    if (_isSubReply(reply))
      this.emit.apply(this, reply);
  } else if (_isSubReply(reply)) {
    this.emit.apply(this, reply);
  } else if (this.isMonitor) {
    this.emit('monitor', reply);
  } else {
    this.emit('error', new Error('Unexpected reply: ' + reply));
  }
};

Client.prototype._flushError = function (error) {
  var value;
  while (value = this._commandValues.shift())
    value.reject(error);
};

Client.prototype._flushPendingWrites = function () {
  var value;
  while (value = this._pendingWrites.shift())
    this._write(value, this._pendingWrites.shift());
};

Client.prototype._write = function (value, write) {
  this._commandValues.push(value);
  this.connection.write(write);
};

/**
 * Connects to Redis. Returns the result of AUTH and SELECT.
 * If neither are needed, this value will always be ["OK", "OK"].
 */
Client.prototype.connect = function () {
  if (!this._connectValue) {
    var self = this;

    this._connectValue = new Promise(function (resolve, reject) {
      var connection = net.createConnection(self.port, self.host);
      connection.setNoDelay(self.noDelay);
      connection.setTimeout(self.timeout);


      connection.on('connect', function () {
        self.connection = connection;

        // Write AUTH and SELECT before flushing pending writes, if needed.
        var authValue = self.password ? self.auth(self.password) : 'OK';
        var selectValue = self.database ? self.select(self.database) : 'OK';
        self._flushPendingWrites();

        resolve(Promise.all([ authValue, selectValue ]));
      });

      connection.on('error', function (error) {
        if (self.connection)
          self._flushError(error);

        reject(error);
      });

      connection.on('data', function (chunk) {
        self.parser.exec(chunk);
      });

      connection.on('close', function () {
        delete self._connectValue;
        delete self.connection;
        self._flushError(new Error('The connection was closed'));
        self.emit('close');
      });
    });
  }

  return this._connectValue;
};

/**
 * Disconnects from Redis.
 */
Client.prototype.disconnect = function () {
  if (this.connection)
    this.connection.end();
};


/**
 * Issues the given Redis command to the server with the given arguments
 * and returns a promise for the reply.
 */
Client.prototype.send = function (command, args) {
  var value = defer();
  var rawArgs = args ? [command].concat(args) : [command];
  var numArgs = rawArgs.length;

  var write = '*' + numArgs + '\r\n';
  var writePos = 1 + Buffer.byteLength(String(numArgs)) + 2;

  var bufferArgs = [];
  var buffer, bufferLength, offset;
  for (var i = 0; i < numArgs; ++i) {
    buffer = rawArgs[i];
    if (buffer instanceof Buffer) {
      bufferLength = buffer.length;
      offset = writePos + Buffer.byteLength(String(bufferLength)) + 3;
      bufferArgs.push([buffer,offset]);

      // insert placeholder into string, will be replaced by buffer content later
      buffer = '';
      for (var j = 0; j < bufferLength; ++j) {
        buffer += '#';
      }
    } else {
      buffer = String(buffer);
      bufferLength = Buffer.byteLength(buffer);
    }

    write += '$' + bufferLength + '\r\n' + buffer + '\r\n';
    writePos += 1 + Buffer.byteLength(String(bufferLength)) + bufferLength + 4;
  }

  var rawCommand = Buffer(write);

  var numBufferArgs = bufferArgs.length;
  for (var i = 0; i < numBufferArgs; ++i) {
    buffer = bufferArgs[i][0];
    offset = bufferArgs[i][1];
    buffer.copy(rawCommand,offset);
  }

  if (this.connection) {
    this._write(value, rawCommand);
  } else {
    this._pendingWrites.push(value, rawCommand);
    this.connect(); // Automatically connect.
  }

  return value.promise;
};

// Add all Redis commands to the Client prototype for convenience.
var _proto = Client.prototype;
var commands = require('./commands');

for (var command in commands) {
  _proto[command] = _proto[command.toUpperCase()] = commands[command];
}

/* helpers */

var messageTypes = { message: true, pmessage: true };

function _isMessageReply(reply) {
  return reply && messageTypes[reply[0]];
}

var subReplyTypes = { subscribe: true, unsubscribe: true, psubscribe: true, punsubscribe: true };

function _isSubReply(reply) {
  return reply && subReplyTypes[reply[0]];
}
