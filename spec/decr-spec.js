require('./helper');

describe('decr', function () {
  describe('when a key does not exist', function () {
    it('returns -1', function () {
      return db.decr('does-not-exist').then(function (reply) {
        assert.strictEqual(reply, -1);
      });
    });
  });

  describe('when a key contains an integer', function () {
    beforeEach(function () {
      return db.set('a-key', 5);
    });

    it('returns the decremented value', function () {
      return db.decr('a-key').then(function (reply) {
        assert.strictEqual(reply, 4);
      });
    });
  });

  describe('when a key does not contain an integer', function () {
    beforeEach(function () {
      return db.set('a-key', 'abc');
    });

    it('returns an error', function () {
      return db.decr('a-key').then(function () {
        assert(false, 'decr succeeded on a non-integer key');
      }, function (error) {
        assert(error);
        assertMatch(error.message, /not an integer/);
      });
    });
  });
});
