require('./helper');

describe('quit', function () {
  var quitter;
  beforeEach(function () {
    quitter = redis.createClient();
  });

  it('emits the "close" event', function (done) {
    quitter.on('close', done);
    quitter.quit();
  });
});
