var assert = require('assert');
var expect = require('expect');
var db = require('./db');

describe('decr', function () {
  describe('when a key does not exist', function () {
    it('returns -1', function () {
      return db.decr('does-not-exist').then(function (reply) {
        expect(reply).toBe(-1);
      });
    });
  });

  describe('when a key contains an integer', function () {
    beforeEach(function () {
      return db.set('a-key', 5);
    });

    it('returns the decremented value', function () {
      return db.decr('a-key').then(function (reply) {
        expect(reply).toBe(4);
      });
    });
  });

  describe('when a key does not contain an integer', function () {
    beforeEach(function () {
      return db.set('a-key', 'abc');
    });

    it('returns an error', function () {
      return db.decr('a-key').then(function () {
        assert(false, 'decr succeeded on a non-integer key');
      }, function (error) {
        assert(error);
        expect(error.message).toMatch(/not an integer/);
      });
    });
  });
});
