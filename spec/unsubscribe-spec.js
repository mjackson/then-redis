require('./helper');

describe('when subscribed to many channels', function () {
  var channels, subscriber;
  beforeEach(function () {
    channels = [ 'abc', 'def' ];
    return redis.connect().then(function (client) {
      subscriber = client;
      return subscriber.subscribe.apply(subscriber, channels);
    });
  });

  describe('unsubscribing from a channel', function () {
    var unsubscribedChannel;
    beforeEach(function (done) {
      unsubscribedChannel = null;

      subscriber.on('unsubscribe', function (channel, numSubscriptions) {
        unsubscribedChannel = channel;
        done();
      });

      subscriber.unsubscribe('abc');
    });

    it('emits the channel name', function () {
      assert.equal(unsubscribedChannel, 'abc');
    });
  });

  describe('unsubscribing from all channels', function () {
    var unsubscribedChannels;
    beforeEach(function (done) {
      unsubscribedChannels = [];

      subscriber.on('unsubscribe', function (channel, numSubscriptions) {
        unsubscribedChannels.push(channel);
        if (unsubscribedChannels.length === channels.length) done();
      });

      subscriber.unsubscribe();
    });

    it('emits all channel names', function () {
      assert.deepEqual(unsubscribedChannels.sort(), channels.sort());
    });
  });
});

describe('when subscribed to no channels', function () {
  var subscriber;
  beforeEach(function () {
    return redis.connect().then(function (client) {
      subscriber = client;
    });
  });

  describe('unsubscribing from all channels', function () {
    it('returns null', function () {
      return subscriber.unsubscribe().then(function (reply) {
        assert.deepEqual(reply, [ 'unsubscribe', null, 0 ]);
      });
    });
  });
});
