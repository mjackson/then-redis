require('./helper');

describe('info', function () {
  it('returns a string of info', function () {
    return db.info().then(function (info) {
      assert(info);
      expect(typeof info).toEqual('object');
      assert(info.redis_version);
    });
  });
});
