require('./helper');

describe('incr', function () {
  describe('when a key does not exist', function () {
    it('returns 1', function () {
      return db.incr('does-not-exist').then(function (reply) {
        expect(reply).toBe(1);
      });
    });
  });

  describe('when a key contains an integer', function () {
    beforeEach(function () {
      return db.set('a-key', 5);
    });

    it('returns the incremented value', function () {
      return db.incr('a-key').then(function (reply) {
        expect(reply).toBe(6);
      });
    });
  });

  describe('when a key does not contain an integer', function () {
    beforeEach(function () {
      return db.set('a-key', 'abc');
    });

    it('returns an error', function () {
      return db.incr('a-key').then(function () {
        assert(false, 'incr succeeded on a non-integer key');
      }, function (error) {
        assert(error);
        assertMatch(error.message, /not an integer/);
      });
    });
  });
});
