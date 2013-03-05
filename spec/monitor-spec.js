require('./helper');

describe('monitor', function () {
  var sender;
  beforeEach(function () {
    sender = redis.createClient();
  });

  describe('when monitoring the database', function () {
    var monitorMessages, sentCommands;
    beforeEach(function () {
      monitorMessages = [];
      sentCommands = [
        [ 'set', 'a', 5 ],
        [ 'incrby', 'a', 6 ],
        [ 'get', 'a' ]
      ];

      db.on('monitor', function (message) {
        monitorMessages.push(message);
      });

      return db.monitor().then(function (reply) {
        assert.equal(reply, 'OK');

        // Send all commands in order.
        var result = q.resolve();

        sentCommands.forEach(function (commandArgs) {
          var command = commandArgs.shift();
          result = result.then(function () {
            return sender.send(command, commandArgs);
          });
        });

        return result;
      });
    });

    it('receives a message for all commands in the order they are sent', function () {
      assert.equal(monitorMessages.length, sentCommands.length);
      monitorMessages.forEach(function (message, index) {
        assertMatch(message, new RegExp('"' + sentCommands[index][0] + '"'));
      });
    });
  });
});
