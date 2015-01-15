var expect = require('expect');
var db = require('./db');

describe('hmget', function () {
  it('returns an array of values for the given keys', function () {
    db.hmset('my-key', 'a', 'one', 'b', 'two', 'c', 'three');

    return db.hmget('my-key', 'a', 'b').then(function (array) {
      expect(array).toEqual([ 'one', 'two' ]);
    });
  });
});
