require('./helper');

describe('when subscribed to many channels', function () {
  var channels;
  beforeEach(function () {
    channels = [ 'abc', 'def' ];
    return db.subscribe.apply(db, channels);
  });

  describe('unsubscribing from a channel', function () {
    var unsubscribedChannel;
    beforeEach(function (done) {
      unsubscribedChannel = null;

      db.on('unsubscribe', function (channel, numSubscriptions) {
        unsubscribedChannel = channel;
        done();
      });

      db.unsubscribe('abc');
    });

    it('emits the channel name', function () {
      assert.equal(unsubscribedChannel, 'abc');
    });
  });

  describe('unsubscribing from all channels', function () {
    var unsubscribedChannels;
    beforeEach(function (done) {
      unsubscribedChannels = [];

      db.on('unsubscribe', function (channel, numSubscriptions) {
        unsubscribedChannels.push(channel);
        if (unsubscribedChannels.length === channels.length) done();
      });

      db.unsubscribe();
    });

    it('emits all channel names', function () {
      compareArrays(unsubscribedChannels.sort(), channels.sort());
    });
  });
});

describe('when subscribed to no channels', function () {
  describe('unsubscribing from all channels', function () {
    it('returns null', function () {
      return db.unsubscribe().then(function (reply) {
        compareArrays(reply, [ 'unsubscribe', null, 0 ]);
      });
    });
  });
});
