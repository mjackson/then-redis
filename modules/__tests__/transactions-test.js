var assert = require('assert');
var expect = require('expect');
var db = require('./db');

describe('transactions', function () {
  describe('when there is no error inside a transaction', function () {
    it('executes the transaction successfully', function () {
      db.multi();
      db.incr('a');
      db.incr('b');
      return db.exec().then(function (reply) {
        expect(reply).toEqual([ 1, 1 ]);
      });
    });
  });

  describe('when there is an error executing the transaction', function () {
    it('returns the error', function () {
      db.multi();
      db.set('a', 'hello');
      db.incr('a');
      return db.exec().then(function (reply) {
        expect(reply.length).toEqual(2);
        expect(reply[1].message).toMatch(/ERR value is not an integer or out of range/);
      });
    });
  });

  describe('when there is an error enqueueing the transaction', function () {
    it('throws the error', function () {
      db.multi();
      return db.send('unknown-command').then(function () {
        assert(false, 'successfully queued non-existent command');
      }, function (error) {
        assert(error);
        return db.discard();
      });
    });
  });
});
