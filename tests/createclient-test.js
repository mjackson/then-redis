var assert = require('assert');
var redis = require('../index');
var db = require('./db');

describe('when a client is created', function () {
  describe('with an options object', function () {
    it('connects with expected properties', function () {
      client = redis.createClient({ host: db.host, port: db.port, password: db.password });
      assert.equal(client.host, db.host);
      assert.equal(client.port, db.port);
    });
  });

  describe('with a url string', function () {
    it('connects with expected properties', function () {
      client = redis.createClient('tcp://localhost:6379');
      assert.equal(client.host, 'localhost');
      assert.equal(client.port, 6379);
    });
  });

  describe('with a unix socket path', function () {
    it('connects with expected properties', function () {
      client = redis.createClient('/tmp/redis.sock');
      assert.equal(client.socket, '/tmp/redis.sock');
    });
  });
});
