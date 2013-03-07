assert = require('assert');
q = require('q');
redis = require('../lib');

// Override mocha's built-in methods with promise-aware versions.
require('mocha-as-promised')();

// A global client instance to use in tests. Tests should not SUBSCRIBE/QUIT
// this client because it must be left in a good state for subsequent tests.
db = null;

before(function () {
  return redis.connect().then(function (client) {
    db = client;
  });
});

beforeEach(function () {
  return db.flushdb().then(function (reply) {
    assertMatch(reply, /OK|QUEUED/);
  });
});

assertMatch = function (string, regexp, message) {
  assert(regexp.test(string), message);
};
