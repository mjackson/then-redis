var assert = require('assert');
var expect = require('expect');
var db = require('./db');

describe('info', function () {
  it('returns an object of info', function () {
    return db.info().then(function (info) {
      assert(info);
      expect(typeof info).toEqual('object');
      assert(info.redis_version);
    });
  });
});
