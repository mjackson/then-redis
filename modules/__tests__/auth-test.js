var assert = require('assert');
var redis = require('../index');
var db = require('./db');

describe('when a server requires auth', function () {
  var password = 'secret';
  beforeEach(function () {
    return db.config('set', 'requirepass', password).then(function () {
      return db.auth(password);
    });
  });

  afterEach(function () {
    return db.config('set', 'requirepass', '');
  });

  describe('a new client with the correct password', function () {
    var client;
    beforeEach(function () {
      client = redis.createClient({ host: db.host, port: db.port, password: password });
    });

    it('does not throw when commands are issued', function () {
      return client.get('a-key');
    });
  });

  describe('a new client with the wrong password', function () {
    it('throws when commands are issued', function (done) {
      var client = redis.createClient({ host: db.host, port: db.port });

      client.on('error', function (error) {
        assert(error);
        done();
      });
    });
  });
});
