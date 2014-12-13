var expect = require('expect');
var db = require('./db');

describe('lpush', function () {
  it('accepts a list of values as arguments', function () {
    db.lpush('my-key', 'c', 'b', 'a');

    return db.lrange('my-key', 0, -1).then(function (hash) {
      expect(hash).toEqual([ 'a', 'b', 'c' ]);
    });
  });

  it('accepts a hash as the second argument', function () {
    db.lpush('my-key', [ 'c', 'b', 'a' ]);

    return db.lrange('my-key', 0, -1).then(function (hash) {
      expect(hash).toEqual([ 'a', 'b', 'c' ]);
    });
  });
});
