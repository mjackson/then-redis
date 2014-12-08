var assert = require('assert');
var expect = require('expect');
var redis = require('../index');

describe('when using buffers as arguments', function () {
  beforeEach(function () {
    db = redis.createClient({ return_buffers: true });
  });

  afterEach(function () {
    return db.flushdb();
  });

  describe('a bulk reply (using get)', function () {
    var target = null;

    beforeEach(function () {
      var targetLength = 256;
      target = new Buffer(targetLength);
      for(var i = 0; i < targetLength; i++) {
        target[i] = i;
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
