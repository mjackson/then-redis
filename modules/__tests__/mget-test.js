var expect = require('expect');
var db = require('./db');

describe('mget', function () {
  it('accepts a list of keys as arguments', function () {
    db.mset({ a: 'one', b: 'two' });

    return db.mget('a', 'b').then(function (list) {
      expect(list).toEqual([ 'one', 'two' ]);
    });
  });

  it('accepts an array of keys as the second argument', function () {
    db.mset({ a: 'one', b: 'two' });

    return db.mget([ 'a', 'b' ]).then(function (list) {
      expect(list).toEqual([ 'one', 'two' ]);
    });
  });
});
