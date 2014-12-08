var expect = require('expect');
var Promise = require('../utils/Promise');
var db = require('./db');

describe('sdiff', function () {
  beforeEach(function () {
    return Promise.all([
      db.sadd('set-one', 1, 2, 3, 4),
      db.sadd('set-two', 3, 4, 5, 6),
      db.sadd('set-three', 6, 7, 8)
    ]);
  });

  it('returns the members of the set resulting from the difference between the first set and all successive sets', function () {
    return db.sdiff('set-one', 'set-two', 'set-three').then(function (diff) {
      expect(diff.sort()).toEqual([ 1, 2 ]);
    });
  });
});
