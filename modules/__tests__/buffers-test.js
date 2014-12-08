var assert = require('assert');
var expect = require('expect');
var redis = require('../index');

describe('when returning buffers', function () {
  var db;
  beforeEach(function () {
    db = redis.createClient({ return_buffers: true });
  });

  afterEach(function () {
    return db.flushdb();
  });

  describe('a bulk reply (using get)', function () {
    describe('when a key exists', function () {
      beforeEach(function () {
        return db.set('a-key', 'a value');
      });

      it('returns a buffer', function () {
        return db.get('a-key').then(function (reply) {
          assert(Buffer.isBuffer(reply));
          expect(reply.toString()).toEqual('a value');
        });
      });
    });

    describe('when a key does not exist', function () {
      it('returns null', function () {
        return db.get('a-key').then(function (reply) {
          expect(reply).toBe(null);
        });
      });
    });
  });

  describe('a multi-bulk reply (using mget)', function () {
    beforeEach(function () {
      return db.mset({
        'a-key': 'a value',
        'b-key': 'b value'
      });
    });

    describe('when all keys exist', function () {
      it('returns buffers', function () {
        return db.mget('a-key', 'b-key').then(function (reply) {
          assert(Array.isArray(reply));
          assert(Buffer.isBuffer(reply[0]));
          assert(Buffer.isBuffer(reply[1]));
        });
      });
    });

    describe('when keys do not exist', function () {
      it('returns null', function () {
        return db.mget('a-key', 'c-key').then(function (reply) {
          assert(Array.isArray(reply));
          assert(Buffer.isBuffer(reply[0]));
          expect(reply[1]).toBe(null);
        });
      });
    });
  });
});
