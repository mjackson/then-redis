var expect = require('expect');
var Promise = Promise || require('bluebird');
var db = require('./db');

describe('sunion', function () {
  beforeEach(function () {
    return Promise.all([
      db.sadd('set-one', 1, 2, 3, 4),
      db.sadd('set-two', 3, 4, 5, 6),
      db.sadd('set-three', 6, 7, 8)
    ]);
  });

  it('returns the members of the set resulting from the union of all given sets', function () {
    return db.sunion('set-one', 'set-two', 'set-three').then(function (union) {
      expect(union.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });
});
