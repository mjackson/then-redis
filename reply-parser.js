var util = require('util');
var events = require('events');
var hiredis = require('hiredis');

module.exports = ReplyParser;

function ReplyParser(returnBuffers) {
  events.EventEmitter.call(this);
  this.returnBuffers = returnBuffers || false;
  this.reset();
}

util.inherits(ReplyParser, events.EventEmitter);

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
