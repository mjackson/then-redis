require('./helper');

describe('msetnx', function () {
  describe('when some of the keys already exist', function () {
    beforeEach(function () {
      return db.set('a', 'one');
    });

    it('returns 0', function () {
      return db.msetnx('a', 'one', 'b', 'two', 'c', 'three').then(function (reply) {
        expect(reply).toBe(0);
      });
    });
  });

  describe('when none of the keys already exist', function () {

    describe('when given a list of fields/values', function () {
      it('sets all keys to the correct values', function () {
        return db.msetnx('a', 'one', 'b', 'two', 'c', 'three').then(function () {
          return db.mget('a', 'b', 'c').then(function (values) {
            expect(values).toEqual([ 'one', 'two', 'three' ]);
          });
        });
      });
    });

    describe('when given a hash', function () {
      it('sets all keys to the correct values', function () {
        return db.msetnx({ a: 'one', b: 'two', c: 'three' }).then(function () {
          return db.mget('a', 'b', 'c').then(function (values) {
            expect(values).toEqual([ 'one', 'two', 'three' ]);
          });
        });
      });
    });

  });
});
