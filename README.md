[![npm package](https://img.shields.io/npm/v/then-redis.svg?style=flat-square)](https://www.npmjs.org/package/then-redis)
[![build status](https://img.shields.io/travis/mjackson/then-redis.svg?style=flat-square)](https://travis-ci.org/mjackson/then-redis)
[![dependency status](https://img.shields.io/david/mjackson/then-redis.svg?style=flat-square)](https://david-dm.org/mjackson/then-redis)
[![code climate](https://img.shields.io/codeclimate/github/mjackson/then-redis.svg?style=flat-square)](https://codeclimate.com/github/mjackson/then-redis)

[then-redis](https://github.com/mjijackson/then-redis) is a fast, promise-based [Redis](http://redis.io) client for [node.js](http://nodejs.org). It's build on top of [node_redis](https://github.com/mranney/node_redis), so it's safe and stable.

### Usage

To create a client:

```js
var redis = require('then-redis');

var db = redis.createClient();
var db = redis.createClient('tcp://localhost:6379');
var db = redis.createClient({
  host: 'localhost',
  port: 6379,
  password: 'password'
});
```

Once you have a client, you're ready to issue some commands. All [Redis commands](http://redis.io/commands) are present on the `Client` prototype and may be called with variable length argument lists*. Every command returns a promise for its result. [Pipelining](http://redis.io/topics/pipelining) happens automatically in most normal usage.

```js
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
```

If you don't like the variable-length argument lists, or you already have an array of arguments that you need to pass to a command, you can always call `client.send()` directly. It takes two arguments: 1) the name of the Redis command and 2) an array of command arguments.

```js
db.send('get', [ 'my-key' ]);
db.send('incrby', [ 'my-key', 5 ]);
db.send('mset', [ 'a', 'one', 'b', 'two' ]);
```

\* `INFO`, `MGET`, `MSET`, `MSETNX`, `HMSET`, `HGETALL`, `LPUSH`, and `RPUSH` optionally accept/return JavaScript objects for convenience in dealing with Redis' multi-key and hash APIs

### Forcibly closing the connection

```js
db.end()
```

### Compatibility

For best results, it is recommended that you use Redis 2.6 or above.

### Installation

Using [npm](https://www.npmjs.org/):

    $ npm install then-redis

### Issues

Please file issues on the [issue tracker on GitHub](https://github.com/mjackson/then-redis/issues).

### Tests

To run the tests in node, first start a redis server on the default port and host and then:

    $ npm install
    $ npm test

### License

[MIT](http://opensource.org/licenses/MIT)
