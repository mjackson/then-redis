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
    var db2;
    beforeEach(function () {
      db2 = redis.createClient({ host: db.host, port: db.port, password: password });
    });

    it('is able to issue commands successfully', function () {
      return db2.get('a-key').then(function (value) {
        assert.strictEqual(value, null);
      });
    });
  });

  describe('a new client with the wrong password', function () {
    var db2;
    beforeEach(function () {
      db2 = redis.createClient({ host: db.host, port: db.port });
    });

    it('is able to issue commands successfully', function () {
      return db2.get('a-key').then(function (value) {
        assert(false, 'client issued command without auth');
      }, function (error) {
        assert(error);
      });
    });
  });
});
