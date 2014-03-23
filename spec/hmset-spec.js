require('./helper');

describe('hmset', function () {
  it('accepts a list of fields/values as arguments', function () {
    db.hmset('my-key', 'a', 'one', 'b', 'two');
    return db.hgetall('my-key').then(function (hash) {
      expect(hash).toEqual({ a: 'one', b: 'two' });
    });
  });

  it('accepts a hash as the only argument', function () {
    db.hmset('my-key', { a: 'one', b: 'two' });
    return db.hgetall('my-key').then(function (hash) {
      expect(hash).toEqual({ a: 'one', b: 'two' });
    });
  });
});
