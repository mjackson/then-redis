require('./helper');

describe('getset', function () {
  describe('when a key does not exist', function () {
    it('returns null', function () {
      return db.getset('does-not-exist', 'hello world').then(function (reply) {
        expect(reply).toBe(null);
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

    it('returns its value and sets the new value', function () {
      return db.getset(key, 'another value').then(function (reply) {
        expect(reply).toBe(expectedReply);
        return db.get(key).then(function (reply) {
          expect(reply).toBe('another value');
        });
      });
    });
  });
});
