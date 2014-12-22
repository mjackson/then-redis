var expect = require('expect');
var db = require('./db');

describe('del', function () {
  describe('when a key does not exist', function () {
    it('returns 0 removed keys', function () {
      return db.del('does-not-exist').then(function (reply) {
        expect(reply).toBe(0);
      });
    });
  });

  describe('when a key exists', function () {
    var key, expectedReply;
    beforeEach(function () {
      key = 'a-key';
      expectedReply = 1;
      return db.set(key, 'hello world');
    });

    it('returns successfully removed count of 1', function () {
      return db.del(key).then(function (reply) {
        expect(reply).toBe(expectedReply);
      });
    });
  });

  describe('when multiple keys exist', function () {
    var key1, key2, key3, expectedReply;
    beforeEach(function () {
      key1 = 'a-key-1';
      key2 = 'a-key-2';
      key3 = 'a-key-3';
      expectedReply = 3;
      db.set(key1, 'hello world');
      db.set(key2, 'hello world2');
      db.set(key3, 'hello world3');
    });

    it('using multiple params, it should return successfully removed count', function () {
      return db.del(key1, key2, key3).then(function (reply) {
        expect(reply).toBe(expectedReply);
      });
    });

    it('using an array as the param, it should return successfully removed count', function () {
      return db.del([key1, key2, key3]).then(function (reply) {
        expect(reply).toBe(expectedReply);
      });
    });
  });
});
