var redis = require('../index');

describe('quit', function () {
  var quitter;
  beforeEach(function () {
    quitter = redis.createClient();
  });

  it('emits the "end" event', function (done) {
    quitter.on('end', done);
    quitter.quit();
  });
});
