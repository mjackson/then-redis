require('./helper');

describe('hmget', function () {
  it('returns an array of values for the given keys', function () {
    db.hmset('my-key', 'a', 'one', 'b', 'two', 'c', 'three');
    return db.hmget('my-key', 'a', 'b').then(function (array) {
      assert.deepEqual(array, [ 'one', 'two' ]);
    });
  });
});
