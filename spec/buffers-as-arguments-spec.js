require('./helper');

describe('when using buffers as arguments', function () {
  beforeEach(function () {
    db.returnBuffers = true;
    db._setupParser();
  });

  afterEach(function () {
    db.returnBuffers = false;
    db._setupParser();
  });

  describe('a bulk reply (using get)', function () {
    var target = null;

    beforeEach(function () {
      var targetLength = Math.floor(Math.random() * 256)
      target = new Buffer(targetLength)
      for(var i = 0; i < targetLength; i++) {
        target[i] = Math.floor(Math.random() * 256)
      }

      return db.set('a-key', target);
    });

    it('returns a buffer', function () {
      return db.get('a-key').then(function (reply) {
        assert(Buffer.isBuffer(reply));
        expect(reply).toEqual(target);
      });
    });
  });

});
