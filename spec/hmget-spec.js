require('./helper');

describe('hmget', function () {
  beforeEach(function () {
    return db.hmset('my-key', 'a', 'one', 'b', 'two', 'c', 'three');
  });

  it('returns an array of values for the given keys', function () {
    return db.hmget('my-key', 'a', 'b').then(function (array) {
      assert.deepEqual(array, [ 'one', 'two' ]);
    });
  });
});
