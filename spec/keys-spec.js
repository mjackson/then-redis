require('./helper');
var crypto = require('crypto');

describe('keys', function () {
  describe('when there are no keys', function () {
    it('returns an empty array', function () {
      return db.keys('*').then(function (keys) {
        assert.deepEqual(keys, []);
      });
    });
  });

  describe('when there are many long keys', function () {
    var hash;
    beforeEach(function () {
      hash = {};

      var key;
      for (var i = 0; i < 200; ++i) {
        key = crypto.randomBytes(256).toString('hex');
        hash[key] = 'value ' + i;
      }

      return db.mset(hash);
    });

    it('returns an array of all keys', function () {
      return db.keys('*').then(function (keys) {
        assert.deepEqual(keys.sort(), Object.keys(hash).sort());
      });
    });
  });
});
