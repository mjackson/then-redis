require('./helper');

describe('quit', function () {
  it('emits the "close" event', function (done) {
    db.on('close', done);
    db.quit();
  });
});
