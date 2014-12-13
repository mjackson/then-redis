var expect = require('expect');
var db = require('./db');

describe('rpush', function () {
  it('accepts a list of values as arguments', function () {
    db.rpush('my-key', 'a', 'b', 'c');

    return db.lrange('my-key', 0, -1).then(function (list) {
      expect(list).toEqual([ 'a', 'b', 'c' ]);
    });
  });

  it('accepts an array as the second argument', function () {
    db.rpush('my-key', [ 'a', 'b', 'c' ]);

    return db.lrange('my-key', 0, -1).then(function (list) {
      expect(list).toEqual([ 'a', 'b', 'c' ]);
    });
  });
});
