var redis = module.exports;

redis.Client = require('./client');
redis.ReplyParser = require('./reply-parser');

redis.createClient = createClient;
function createClient(options) {
  return new redis.Client(options);
}

redis.connect = connect;
function connect(options) {
  var client = redis.createClient(options);
  return client.connect().then(function () {
    return client;
  });
}
