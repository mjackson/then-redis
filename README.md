Intro
=====

hum-redis is a simple, promise-based [Redis](http://redis.io) client. It supports all features of Redis in a very small, user-friendly package.

The two major differences between hum-redis and [node_redis](https://github.com/mranney/node_redis) are:

  1. hum-redis returns a promise when you issue a command
  2. The entire hum-redis client is about 200 LOC

hum-redis tries to get out of your way as much as possible. Command arguments and return values are exactly what you see in [Redis' Command Reference](http://redis.io/commands)*. All Redis commands are available as instance methods on clients that accept variable length argument lists.

hum-redis uses [pipelining](http://redis.io/topics/pipelining) to issue all commands. This means that commands are issues over the TCP socket as quickly as possible, and that subsequent commands do not need to wait to find out the result of previous commands before they are issued.

\* Except for `MSET`, `HMSET` and `HGETALL` which optionally accept/return hashes (i.e. JavaScript objects) for convenience.

Usage
=====

    var redis = require('hum-redis');
    var db = redis.createClient();

    // Simple set, incrby, and get
    db.set('my-key', 1);
    db.incrby('my-key', 5);
    db.get('my-key').then(function (reply) {
      assert.strictEqual(reply, 6);
    });

    // Sets
    db.sadd('my-set', 1, 2, 3);
    db.sismember('my-set', 2).then(function (reply) {
      assert.strictEqual(reply, 1);
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

Testing
=======

To run the tests:

    $ npm install
    $ npm test

License
=======

Copyright 2013 Michael Jackson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
