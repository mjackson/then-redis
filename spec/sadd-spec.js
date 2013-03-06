require('./helper');

describe('sadd', function () {
  it('returns the number of items added to a set', function () {
    return db.sadd('my-set', 1, 2, 3, 3, 4, 4, 4).then(function (numItemsAdded) {
      assert.strictEqual(numItemsAdded, 4);
    });
  });
});
