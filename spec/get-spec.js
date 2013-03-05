require('./helper');

describe('get', function () {
  describe('when a key does not exist', function () {
    it('returns null', function () {
      return db.get('does-not-exist').then(function (reply) {
        assert.strictEqual(reply, null);
      });
    });
  });

  describe('when a key exists', function () {
    var key, expectedReply;
    beforeEach(function () {
      key = 'a-key';
      expectedReply = 'hello world';
      return db.set(key, expectedReply);
    });

    it('returns its value', function () {
      return db.get(key).then(function (reply) {
        assert.strictEqual(reply, expectedReply);
      });
    });
  });
});
