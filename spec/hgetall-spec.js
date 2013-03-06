require('./helper');

describe('hgetall', function () {
  beforeEach(function () {
    return db.hmset('my-key', 'a', 'one', 'b', 'two', 'c', 'three');
  });

  it('returns all fields and values of the hash at the given key', function () {
    return db.hgetall('my-key').then(function (hash) {
      assert.deepEqual(hash, { a: 'one', b: 'two', c: 'three' });
    });
  });
});
