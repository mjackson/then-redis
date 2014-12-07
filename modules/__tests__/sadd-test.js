var expect = require('expect');
var db = require('./db');

describe('sadd', function () {
  it('returns the number of items added to a set', function () {
    return db.sadd('my-set', 1, 2, 3, 3, 4, 4, 4).then(function (numItemsAdded) {
      expect(numItemsAdded).toBe(4);
    });
  });
});
