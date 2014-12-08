var expect = require('expect');
var redis = require('../index');

// Note: Use this instance in all tests.
var db = redis.createClient();

beforeEach(function () {
  return db.flushdb().then(function (reply) {
    expect(reply).toEqual('OK');
  });
});

module.exports = db;
