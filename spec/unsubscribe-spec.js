require('./helper');

describe('when subscribed to many channels', function () {
  var channels, subscriber;
  beforeEach(function () {
    channels = [ 'abc', 'def' ];
    subscriber = redis.createClient();
    return subscriber.subscribe.apply(subscriber, channels);
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
      expect(unsubscribedChannel).toEqual('abc');
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
      expect(unsubscribedChannels.sort()).toEqual(channels.sort());
    });
  });
});

describe('when subscribed to no channels', function () {
  var subscriber;
  beforeEach(function () {
    subscriber = redis.createClient();
  });

  describe('unsubscribing from all channels', function () {
    it('returns null', function () {
      return subscriber.unsubscribe().then(function (reply) {
        expect(reply).toEqual([ 'unsubscribe', null, 0 ]);
      });
    });
  });
});
