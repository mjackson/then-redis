var expect = require('expect');
var db = require('./db');

describe('mset', function () {
  describe('when given a list of fields/values', function () {
    it('sets all keys to the correct values', function () {
      return db.mset('a', 'one', 'b', 'two', 'c', 'three').then(function () {
        return db.mget('a', 'b', 'c').then(function (values) {
          expect(values).toEqual([ 'one', 'two', 'three' ]);
        });
      });
    });
  });

  describe('when given a hash', function () {
    it('sets all keys to the correct values', function () {
      return db.mset({ a: 'one', b: 'two', c: 'three' }).then(function () {
        return db.mget('a', 'b', 'c').then(function (values) {
          expect(values).toEqual([ 'one', 'two', 'three' ]);
        });
      });
    });
  });
});
