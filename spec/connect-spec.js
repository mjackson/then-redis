require('./helper');

describe('connect', function () {
  describe('when the database does not require a password', function () {
    describe('and a client does not use a password', function () {
      var client;
      beforeEach(function () {
        client = redis.createClient({ host: db.host, port: db.port });
      });

      it('returns successfully', function () {
        return client.connect();
      });
    });

    describe('and a client uses a password', function () {
      var client;
      beforeEach(function () {
        client = redis.createClient({ host: db.host, port: db.port, password: 'password' });
      });

      it('throws', function () {
        return client.connect().then(function () {
          assert(false, 'client connected successfully with password to server that does not require password');
        }, function (error) {
          assert(error);
        });
      });
    });
  });

  describe('when the database requires a password', function () {
    var password = 'secret';
    beforeEach(function () {
      return db.config('set', 'requirepass', password).then(function () {
        return db.auth(password);
      });
    });

    afterEach(function () {
      return db.config('set', 'requirepass', '');
    });

    describe('and a client uses the correct password', function () {
      var client;
      beforeEach(function () {
        client = redis.createClient({ host: db.host, port: db.port, password: password });
      });

      it('returns successfully', function () {
        return client.connect();
      });
    });

    describe('and a client uses the wrong password', function () {
      var client;
      beforeEach(function () {
        client = redis.createClient({ host: db.host, port: db.port, password: 'wrong' });
      });

      it('throws', function () {
        return client.connect().then(function () {
          assert(false, 'client connected successfully without password to server that requires password');
        }, function (error) {
          assert(error);
        });
      });
    });
  });
});
