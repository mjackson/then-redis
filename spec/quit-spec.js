require('./helper');

describe('quit', function () {
  var quitter;
  beforeEach(function () {
    return redis.connect().then(function (client) {
      quitter = client;
    });
  });

  it('emits the "close" event', function (done) {
    quitter.on('close', done);
    quitter.quit();
  });
});
