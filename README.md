then-redis
==========

then-redis is a small, promise-based [Redis](http://redis.io) client. It supports all the features of Redis in a simple, user-friendly package.

The two major differences between then-redis and [node_redis](https://github.com/mranney/node_redis) are:

  1. then-redis returns a promise when you issue a command
  2. The entire codebase is very small (~300 LOC), just like Redis

then-redis gets out of your way as much as possible. Command arguments and return values are exactly what you see in [Redis' Command Reference](http://redis.io/commands)*.

then-redis uses [pipelining](http://redis.io/topics/pipelining) to issue all commands. This means that commands are issued over the socket connection as quickly as possible, and that subsequent commands do not need to wait to find out the result of previous commands before they are issued. Of course, if you need to find out the result of a previous command first, just use `then` (see the examples below).

\* `MSET`, `MSETNX`, `HMSET` and `HGETALL` optionally accept/return JavaScript objects for convenience in dealing with Redis' multi-key and hash APIs

### Usage

All of the usage examples assume the following:

    var redis = require('then-redis');

To create a client:

    var db = redis.createClient();
    var db = redis.createClient('tcp://localhost:6379');
    var db = redis.createClient({
      host: 'localhost',
      port: 6379
    });

If you need to use [AUTH](http://redis.io/commands/auth) or [SELECT](http://redis.io/commands/select) you can include them in the auth segment of your URL or in the `password` and `database` properties of an object literal.

    var db = redis.createClient('tcp://1:password@localhost:6379');
    var db = redis.createClient({
      host: 'localhost',
      port: 6379,
      database: 1,
      password: 'password'
    });

Once you have a client, you're ready to issue some commands. All Redis commands are present on the `redis.Client` prototype and may be called with variable length argument lists.

    // Simple set, incrby, and get
    db.set('my-key', 1);
    db.incrby('my-key', 5);
    db.get('my-key').then(function (value) {
      assert.strictEqual(value, 6);
    });

    // Multi-key set/get
    db.mset({ a: 'one', b: 'two' });
    db.mget('a', 'b').then(function (values) {
      assert.deepEqual(values, [ 'one', 'two' ]);
    });

    // Sets
    db.sadd('my-set', 1, 2, 3);
    db.sismember('my-set', 2).then(function (value) {
      assert.strictEqual(value, 1);
    });

    // Hashes
    var originalHash = { a: 'one', b: 'two' };
    db.hmset('my-hash', originalHash);
    db.hgetall('my-hash').then(function (hash) {
      assert.deepEqual(hash, originalHash);
    });

    // Transactions
    db.multi();
    db.incr('first-key');
    db.incr('second-key');
    db.exec().then(function (reply) {
      assert.deepEqual(reply, [ 1, 1 ]);
    });

    // Pubsub
    var subscriber = redis.createClient();
    subscriber.on('message', function (channel, message) {
      console.log('Received message: ' + message);
    });
    subscriber.subscribe('my-channel').then(function () {
      db.publish('my-channel', 'a message');
    });

When you create a client without explicitly calling `client.connect()` afterwards it will try to automatically establish a connection the first time you issue a command. While it's waiting for the connection to be established it will buffer all commands and then flush them in the correct order once the socket is open. This works beautifully most of the time (all the specs are written in this style), but it will throw if your connection fails for some reason.

To be sure you have a good connection to the database before issuing any commands, call `client.connect()` or use the high-level `redis.connect(options)` method to create a client and connect in one call. Use `then` to wait for the response from Redis before continuing.

    // Create a separate client instance and connect() it.
    var db = redis.createClient(options);
    db.connect().then(function () {
      db.get('my-key');
    }, function (error) {
      console.log('Failed to connect to Redis: ' + error);
    });

    // Or use redis.connect() to do both in one call.
    redis.connect(options).then(function (db) {
      db.get('my-key');
    }, function (error) {
      console.log('Failed to connect to Redis: ' + error);
    });

The [specs](https://github.com/mjijackson/then-redis/tree/master/spec) also have lots of good usage examples.

### Testing

To run the tests:

    $ redis-server --port 6379
    $ npm install
    $ npm test

### License

Copyright 2013 Michael Jackson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
