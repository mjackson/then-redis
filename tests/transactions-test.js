var assert = require('assert');
var expect = require('expect');
var db = require('./db');
var Promise = require('bluebird');

describe('transactions', function () {
  describe('when there is no error inside a transaction', function () {
    it('executes the transaction successfully', function () {
      var multi = db.multi();
      multi.incr('a');
      multi.incr('b');
      return multi.exec().then(function (reply) {
        expect(reply).toEqual([ 1, 1 ]);
      });
    });
  });

  describe('when there is an error executing the transaction', function () {
    it('returns the error', function () {
      var multi = db.multi();
      multi.set('a', 'hello');
      multi.incr('a');
      return multi.exec().then(function (reply) {
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
        var multi = db.multi();

        return wait(10).then(function () {
          multi.set('a', 'x');
          return wait(10);
        }).then(function () {
          multi.set('b', 'y');
          return wait(10);
        }).then(function () {
          multi.set('c', 'z');
          return wait(10);
        }).then(function () {
          return multi.exec();
        });
      }

      function transaction2() {
        var multi = db.multi();

        return wait(10).then(function () {
          multi.set('a', 'a');
          return wait(10);
        }).then(function () {
          multi.set('b', 'b');
          return wait(10);
        }).then(function () {
          return multi.exec();
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
