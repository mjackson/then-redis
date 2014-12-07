var expect = require('expect');
var db = require('./db');

describe('scard', function () {
  describe('when a set is empty', function () {
    it('returns 0', function () {
      return db.scard('my-set').then(function (cardinality) {
        expect(cardinality).toBe(0);
      });
    });
  });

  describe('when a set has 4 members', function () {
    it('returns the cardinality of the set', function () {
      return db.sadd('my-set', 1, 2, 3, 4).then(function (numItemsAdded) {
        expect(numItemsAdded).toBe(4);
        return db.scard('my-set').then(function (cardinality) {
          expect(cardinality).toBe(4);
        });
      });
    });
  });
});
