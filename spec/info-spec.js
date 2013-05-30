require('./helper');

describe('info', function () {
  it('returns a string of info', function () {
    return db.info().then(function (info) {
      assert(info);
      assert.equal(typeof info, 'object');
      assert(info.redis_version);
    });
  });
});
