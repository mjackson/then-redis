require('./helper');

describe('when a server requires auth', function () {
  var password = 'secret';
  beforeEach(function () {
    return db.config('set', 'requirepass', password).then(function () {
      return db.auth(password);
    });
  });

  afterEach(function () {
    return db.config('set', 'requirepass', '');
  });

  describe('a new client with the correct password', function () {
    var newClient;
    beforeEach(function () {
      return redis.connect({ host: db.host, port: db.port, password: password }).then(function (client) {
        newClient = client;
      });
    });

    it('does not throw when commands are issued', function () {
      return newClient.get('a-key');
    });
  });

  describe('a new client with the wrong password', function () {
    var newClient;
    beforeEach(function () {
      return redis.connect({ host: db.host, port: db.port }).then(function (client) {
        newClient = client;
      });
    });

    it('throws when commands are issued', function () {
      return newClient.get('a-key').then(function (value) {
        assert(false, 'client issued command without auth');
      }, function (error) {
        assert(error);
      });
    });
  });
});
