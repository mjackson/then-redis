require('./helper');

describe('subscribe', function () {
  var subscriber;
  beforeEach(function () {
    subscriber = redis.createClient();
  });

  // Sends the given messages in order to the given channel.
  function sendMessages(channel, messages) {
    var result = new rsvp.Promise;
    result.resolve();

    messages.forEach(function (message) {
      result = result.then(function () {
        return db.publish(channel, message);
      });
    });

    return result;
  }

  describe('when subscribing to a channel', function () {
    var receivedMessages, sentMessages;
    beforeEach(function () {
      receivedMessages = [];
      sentMessages = [ 'a', 'b', 'c' ];

      subscriber.on('message', function (channel, message) {
        receivedMessages.push(message);
      });

      return subscriber.subscribe('a').then(function () {
        return sendMessages('a', sentMessages).then(waitForDelivery);
      });
    });

    it('streams messages that are sent to that channel', function () {
      assert.deepEqual(receivedMessages, sentMessages);
    });
  });

  describe('when subscribing to many channels', function () {
    var aReceivedMessages, bReceivedMessages;
    var aSentMessages, bSentMessages;
    beforeEach(function () {
      aReceivedMessages = [];
      bReceivedMessages = [];
      aSentMessages = [ 'a', 'b', 'c' ];
      bSentMessages = [ 'd', 'e', 'f' ];

      subscriber.on('message', function (channel, message) {
        if (channel === 'a') aReceivedMessages.push(message);
        if (channel === 'b') bReceivedMessages.push(message);
      });

      return rsvp.all([
        subscriber.subscribe('a'),
        subscriber.subscribe('b')
      ]).then(function () {
        return rsvp.all([
          sendMessages('a', aSentMessages),
          sendMessages('b', bSentMessages)
        ]).then(waitForDelivery);
      });
    });

    it('streams messages that are sent to any of those channels', function () {
      assert.deepEqual(aReceivedMessages, aSentMessages);
      assert.deepEqual(bReceivedMessages, bSentMessages);
    });
  });
});

// Waits for pubsub messages to be delivered.
function waitForDelivery() {
  return wait(10);
}
