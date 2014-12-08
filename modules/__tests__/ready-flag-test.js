var expect = require('expect');
var redis = require('../index');

describe('ready-flag', function () {
  var client;
  beforeEach(function () {
    client = redis.createClient();
  });

  it('is set on ready', function (done) {
    client.on('ready', function () {
      expect(client.ready).toEqual(true);
      done();
    });
  });
});
