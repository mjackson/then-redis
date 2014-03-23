require('./helper');

describe('set', function () {
  var key, expectedReply;
  beforeEach(function () {
    key = 'a-key';
    expectedReply = 'hello world';
    return db.set(key, expectedReply);
  });

  it('sets the value of a key', function () {
    return db.get(key).then(function (reply) {
      expect(reply).toBe(expectedReply);
    });
  });
});
