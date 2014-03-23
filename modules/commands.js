var commands = [
  // keys
  'del', 'dump', 'exists', 'expire', 'expireat', 'keys', 'migrate', 'move',
  'object', 'persist', 'pexpire', 'pexpireat', 'pttl', 'randomkey', 'rename',
  'renamenx', 'restore', 'sort', 'ttl', 'type',
  // strings
  'append', 'bitcount', 'bitop', 'decr', 'decrby', 'get', 'getbit', 'getrange',
  'getset', 'incr', 'incrby', 'incrbyfloat', 'mget', 'mset', 'msetnx', 'psetex',
  'set', 'setbit', 'setex', 'setnx', 'setrange', 'strlen',
  // hashes
  'hdel', 'hexists', 'hget', 'hgetall', 'hincrby', 'hincrbyfloat', 'hkeys', 'hlen',
  'hmget', 'hmset', 'hset', 'hsetnx', 'hvals',
  // lists
  'blpop', 'brpop', 'brpoplpush', 'lindex', 'linsert', 'llen', 'lpop', 'lpush',
  'lpushx', 'lrange', 'lrem', 'lset', 'ltrim', 'rpop', 'rpoplpush', 'rpush', 'rpushx',
  // sets
  'sadd', 'scard', 'sdiff', 'sdiffstore', 'sinter', 'sinterstore', 'sismember',
  'smembers', 'smove', 'spop', 'srandmember', 'srem', 'sunion', 'sunionstore',
  // sorted sets
  'zadd', 'zcard', 'zcount', 'zincrby', 'zinterstore', 'zrange', 'zrangebyscore',
  'zrank', 'zrem', 'zremrangebyrank', 'zremrangebyscore', 'zrevrange', 'zrevrangebyscore',
  'zrevrank', 'zscore', 'zunionstore',
  // pubsub
  'psubscribe', 'publish', 'punsubscribe', 'subscribe', 'unsubscribe',
  // transactions
  'discard', 'exec', 'multi', 'unwatch', 'watch',
  // scripting
  'eval', 'evalsha', 'script',
  // connection
  'auth', 'echo', 'ping', 'quit', 'select',
  // server
  'bgrewriteaof', 'bgsave', 'client', 'config', 'dbsize', 'debug', 'flushall',
  'flushdb', 'info', 'lastsave', 'monitor', 'save', 'shutdown', 'slaveof',
  'slowlog', 'sync', 'time'
];

var _slice = Array.prototype.slice;

commands.forEach(function (command) {
  exports[command] = function () {
    return this.send(command, _slice.call(arguments, 0));
  };
});

/* overrides */

// Parse the reply from INFO into a hash.
exports.info = function (section) {
  return this.send('info', _slice.call(arguments, 0)).then(parseInfo);
};

// Set the client's password property to the given value on AUTH.
exports.auth = function (password) {
  var self = this;
  return this.send('auth', [ password ]).then(function (reply) {
    self.password = password;
    return reply;
  });
};

// Set the client's database property to the database number on SELECT.
exports.select = function (database) {
  this.database = database;
  return this.send('select', [ database ]);
};

// Set the client's isMonitor property to true on MONITOR.
exports.monitor = function () {
  this.isMonitor = true;
  return this.send('monitor');
};

// Optionally accept a hash as the only argument to MSET.
exports.mset = function (hash) {
  var args = (typeof hash === 'object') ? appendHashToArray(hash, []) : _slice.call(arguments, 0);
  return this.send('mset', args);
};

// Optionally accept a hash as the only argument to MSETNX.
exports.msetnx = function (hash) {
  var args = (typeof hash === 'object') ? appendHashToArray(hash, []) : _slice.call(arguments, 0);
  return this.send('msetnx', args);
};

// Optionally accept a hash as the first argument to HMSET after the key.
exports.hmset = function (key, hash) {
  var args = (typeof hash === 'object') ? appendHashToArray(hash, [ key ]) : _slice.call(arguments, 0);
  return this.send('hmset', args);
};

// Make a hash from the result of HGETALL.
exports.hgetall = function () {
  return this.send('hgetall', _slice.call(arguments, 0)).then(makeHashFromArray);
};

/* helpers */

function appendHashToArray(hash, array) {
  for (var field in hash) {
    if (hash.hasOwnProperty(field))
      array.push(field, hash[field]);
  }

  return array;
}

function makeHashFromArray(array) {
  var hash = {};

  for (var i = 0, len = array.length; i < len; i += 2)
    hash[array[i]] = array[i + 1];

  return hash;
}

function parseInfo(info) {
  var hash = {};

  info.split('\r\n').forEach(function (line) {
    var index = line.indexOf(':');
    if (index !== -1) {
      var name = line.substring(0, index);
      hash[name] = line.substring(index + 1);
    }
  });

  return hash;
}
