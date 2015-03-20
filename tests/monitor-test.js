var expect = require('expect');
var redis = require('../index');
if (typeof Promise === 'undefined') var Promise = Promise || require('bluebird');
var db = require('./db');

describe('monitor', function () {
  var monitor;
  beforeEach(function () {
    monitor = redis.createClient();
  });

  describe('when monitoring the database', function () {
    var monitorMessages, commands;
    beforeEach(function () {
      monitorMessages = [];
      commands = [
        [ 'set', 'a', 5 ],
        [ 'incrby', 'a', 6 ],
        [ 'get', 'a' ]
      ];

      monitor.on('monitor', function (time, args) {
        monitorMessages.push(args);
      });

      return monitor.monitor().then(function (reply) {
        expect(reply).toEqual('OK');

        // Send all commands in order.
        var result = Promise.resolve();

        commands.forEach(function (command) {
          result = result.then(function () {
            return db.send(command[0], command.slice(1));
          });
        });

        return result.then(waitForDelivery);
      });
    });

    it('receives a message for all commands in the order they are sent', function () {
      expect(monitorMessages.length).toEqual(commands.length);

      monitorMessages.forEach(function (args, index) {
        expect(args).toEqual(commands[index]);
      });
    });
  });
});

function waitForDelivery() {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, 10);
  });
}
