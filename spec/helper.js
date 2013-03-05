assert = require('assert');
q = require('q');
redis = require('../lib');

// Override mocha's built-in methods with promise-aware versions.
require('mocha-as-promised')();

// A global client instance to use in tests.
db = null;

beforeEach(function () {
  db = redis.createClient();
  return db.flushdb().then(function (reply) {
    assert.equal(reply.toString(), 'OK');
  });
});

assertMatch = function (string, regexp, message) {
  assert(regexp.test(string), message);
};

// A global API for waiting for pubsub message delivery.
waitForMessages = function (delay) {
  return q.delay(delay || 10);
};
