var expect = require('expect');
var redis = require('../index');
var net = require('net');

// redis.createClient();
// redis.createClient('tcp://localhost:6379');
// redis.createClient(options);
// redis.createClient(port, host, options);
// redis.createClient();
// redis.createClient(unix_socket, options);
// redis.createClient('redis://user:pass@host:port', options);

describe('connection', function () {

  var options = {
    host: 'localhost',
    port: 6379,
    password: 'password'
  };

  it('is set on connect (method #1)', function (done) {
    var client = redis.createClient();
    client.on('connect', function () {
      expect(client.connected).toEqual(true);
      done();
    });
  });   
  
  it('is set on connect (method #2)', function (done) {
    var client = redis.createClient('tcp://localhost:6379');
    client.on('connect', function () {
      expect(client.connected).toEqual(true);
      done();
    });
  });  
  
  it('is set on connect (method #3)', function (done) {
    var client = redis.createClient(options);
    client.on('connect', function () {
      expect(client.connected).toEqual(true);
      done();
    });
  });  
  
  it('is set on connect (method #4)', function (done) {
    var client = redis.createClient(options.port, options.host, options);
    client.on('connect', function () {
      expect(client.connected).toEqual(true);
      done();
    });
  });  
  
  it('is set on connect (method #5)', function (done) {
    var client = redis.createClient();
    client.on('connect', function () {
      expect(client.connected).toEqual(true);
      done();
    });
  });  
  
  it('is set on connect (method #6)', function (done) {
    var unix_socket = net.createConnection(6379, 'localhost');
    var client = redis.createClient(unix_socket, options);
    client.on('connect', function () {
      expect(client.connected).toEqual(true);
      done();
    });
  });  
  
  it('is set on connect (method #7)', function (done) {
    var client = redis.createClient('redis://user:pass@localhost:6379', options);
    client.on('connect', function () {
      expect(client.connected).toEqual(true);
      done();
    });
  });  

});
