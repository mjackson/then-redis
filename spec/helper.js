assert = require('assert');
redis = require('../modules');

// Override mocha's built-in methods with promise-aware versions.
require('mocha-as-promised')();

// A global client instance to use in tests. Tests should not SUBSCRIBE/QUIT
// this client because it must be left in a good state for subsequent tests.
db = redis.createClient();

beforeEach(function () {
  return db.flushdb().then(function (reply) {
    assert.equal(reply, 'OK');
  });
});

assertMatch = function (string, regexp, message) {
  assert(regexp.test(string), message);
};

var RSVP = require('rsvp');

wait = function (ms) {
  var deferred = RSVP.defer();
  setTimeout(deferred.resolve, ms);
  return deferred.promise;
};
