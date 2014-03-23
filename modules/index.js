exports.Client = require('./client');
exports.ReplyParser = require('./reply-parser');

exports.createClient = function (options) {
  return new exports.Client(options);
};

exports.connect = function (options) {
  var client = exports.createClient(options);
  
  return client.connect().then(function () {
    return client;
  });
};
