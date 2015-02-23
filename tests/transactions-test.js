var assert = require('assert');
var expect = require('expect');
var db = require('./db');
var Promise = require('bluebird');

describe('transactions', function () {
  describe('multi', function () {
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
          expect(reply[1]).toEqual('ERR value is not an integer or out of range');
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

  describe('exec', function () {
    describe('when there is no error inside a transaction', function () {
      it('executes the transaction successfully', function () {
        return db.exec(function (multi) {
          multi.incr('a');
          multi.incr('b');
        }).then(function (reply) {
          expect(reply).toEqual([ 1, 1 ]);
        });
      });
    });

    describe('when there is an error executing the transaction', function () {
      it('returns the error', function () {
        return db.exec(function (multi) {
          multi.set('a', 'hello');
          multi.incr('a');
        }).then(function (reply) {
          expect(reply.length).toEqual(2);
          expect(reply[1]).toEqual('ERR value is not an integer or out of range');
        });
      });
    });

    describe('transactions are atomic', function () {
      it('throws the error', function () {
        var log = [];

        function wait(n) {
          return new Promise(function (fulfil) {
            setTimeout(fulfil, n);
          });
        }

        function transaction1() {
          return db.exec(function (multi) {
            multi.set('a', 'x');
            multi.set('b', 'y');
            multi.set('c', 'z');
          });
        }

        function transaction2() {
          return db.exec(function (multi) {
            multi.set('a', 'a');
            multi.set('b', 'b');
          });
        }

        function logValues() {
          return db.mget('a', 'b', 'c').then(function (results) {
            log.push(results);
            if (results[2] !== 'z') {
              return logValues();
            }
          });
        }

        return Promise.all([transaction1(), transaction2(), logValues()]).then(function (results) {
          var momentsWhenAAndBAreDifferent = log.filter(function (entry) {
            return entry[0] && entry[1] && entry[0] === entry[1];
          });
          expect(momentsWhenAAndBAreDifferent).toEqual([]);
          expect(results[0]).toEqual(['OK', 'OK', 'OK']);
          expect(results[1]).toEqual(['OK', 'OK']);
        });
      });
    });
  });
});
