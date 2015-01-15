var crypto = require('crypto');
var expect = require('expect');
var db = require('./db');

describe('keys', function () {
  describe('when there are no keys', function () {
    it('returns an empty array', function () {
      return db.keys('*').then(function (keys) {
        expect(keys).toEqual([]);
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
        expect(keys.sort()).toEqual(Object.keys(hash).sort());
      });
    });
  });
});
