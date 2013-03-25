assert = require('assert');
when = require('when');
redis = require('../lib');

// Override mocha's built-in methods with promise-aware versions.
require('mocha-as-promised')();

// A global client instance to use in tests. Tests should not SUBSCRIBE/QUIT
// this client because it must be left in a good state for subsequent tests.
db = redis.createClient();

beforeEach(function () {
  return db.flushdb().then(function (reply) {
    assert.strictEqual(reply, 'OK');
  });
});

assertMatch = function (string, regexp, message) {
  assert(regexp.test(string), message);
};

var delay = require('when/delay');
wait = function (ms) {
  return delay(null, ms);
};
