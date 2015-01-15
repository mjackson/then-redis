var expect = require('expect');
var redis = require('../index');

describe('connection-flag', function () {
  var client;
  beforeEach(function () {
    client = redis.createClient();
  });

  it('is set on connect', function (done) {
    client.on('connect', function () {
      expect(client.connected).toEqual(true);
      done();
    });
  });
});
