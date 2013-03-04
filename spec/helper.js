assert = require('assert');
redis = require('../index');

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

assert.match = function (string, regexp, message) {
  assert(regexp.test(string), message);
};
