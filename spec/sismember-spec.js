require('./helper');

describe('sismember', function () {
  beforeEach(function () {
    return db.sadd('my-key', 1, 2, 3);
  });

  it('returns 1 when the set at the given key contains a member', function () {
    return db.sismember('my-key', 2).then(function (reply) {
      expect(reply).toBe(1);
    });
  });

  it('returns 0 when the set at the given key does not contain a member', function () {
    return db.sismember('my-key', 4).then(function (reply) {
      expect(reply).toBe(0);
    });
  });
})