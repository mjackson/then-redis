var Client = require('./client');
var ReplyParser = require('./reply-parser');

exports.Client = Client;
exports.ReplyParser = ReplyParser;

exports.createClient = createClient;
function createClient(options) {
  return new Client(options);
}

exports.connect = connect;
function connect(options) {
  var client = createClient(options);
  return client.connect().then(function () {
    return client;
  });
}
