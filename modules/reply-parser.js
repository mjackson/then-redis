var util = require('util');
var EventEmitter = require('events').EventEmitter;
var hiredis = require('hiredis');

module.exports = ReplyParser;

/**
 * A thin wrapper for the hiredis library that parses responses from Redis
 * and emits "reply" and "error" events.
 */
function ReplyParser(returnBuffers) {
  EventEmitter.call(this);
  this.returnBuffers = returnBuffers || false;
  this.reset();
}

util.inherits(ReplyParser, EventEmitter);

ReplyParser.prototype.reset = function () {
  this.reader = new hiredis.Reader({
    return_buffers: this.returnBuffers
  });
};

ReplyParser.prototype.exec = function (chunk) {
  this.reader.feed(chunk);

  var reply;
  while (true) {
    try {
      reply = this.reader.get();
    } catch (err) {
      this.emit('error', err);
      break;
    }

    if (reply === undefined) break;

    this.emit('reply', reply);
  }
};
