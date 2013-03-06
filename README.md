then-redis
==========

then-redis is a small, promise-based [Redis](http://redis.io) client. It supports all the features of Redis in a simple, user-friendly package.

The two major differences between then-redis and [node_redis](https://github.com/mranney/node_redis) are:

  1. then-redis returns a promise when you issue a command
  2. The entire codebase is very small (~300 LOC), just like Redis

then-redis gets out of your way as much as possible. Command arguments and return values are exactly what you see in [Redis' Command Reference](http://redis.io/commands)*. All Redis commands are available as instance methods on clients that accept variable length argument lists.

then-redis uses [pipelining](http://redis.io/topics/pipelining) to issue all commands. This means that commands are issues over the TCP socket as quickly as possible, and that subsequent commands do not need to wait to find out the result of previous commands before they are issued.

\* `MSET`, `MSETNX`, `HMSET` and `HGETALL` optionally accept/return JavaScript objects for convenience in dealing with Redis' multi-key and hash APIs

Usage
=====

    var redis = require('then-redis');

    // Creating a client
    var db = redis.createClient();
    var db = redis.createClient('tcp://localhost:6379');
    var db = redis.createClient({
      host: 'localhost',
      port: 6379,
      returnBuffers: true
    });

    // AUTH and SELECT are done for you if you need it.
    var db = redis.createClient({
      host: 'localhost',
      port: 6379,
      database: 1,
      password: 'password'
    });
    var db = redis.createClient('tcp://1:password@localhost:6379');

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

    // Pubsub
    var sub = redis.createClient();
    sub.subscribe('my-channel').then(function () {
      sub.on('message', function (channel, message) {
        console.log('Received message: ' + message);
      });

      return db.publish('my-channel', 'a message');
    });

    // Transactions
    db.multi();
    db.incr('first-key');
    db.incr('second-key');
    db.exec().then(function (reply) {
      assert.deepEqual(reply, [ 1, 1 ]);
    });

The [specs](https://github.com/mjijackson/then-redis/tree/master/spec) also have lots of good usage examples.

Testing
=======

To run the tests:

    $ redis-server --port 6379
    $ npm install
    $ npm test

License
=======

Copyright 2013 Michael Jackson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
