var _slice = Array.prototype.slice;
var commands = module.exports;

[
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
].forEach(function (command) {
  commands[command] = function () {
    return this.send(command, _slice.call(arguments, 0));
  };
});

/* overrides */

// Parse info into a hash.
commands.info = function (section) {
  return this.send('info', _slice.call(arguments, 0)).then(parseInfo);
};

// Set the client's password property to the given value on AUTH.
commands.auth = function (password) {
  var self = this;
  return this.send('auth', [ password ]).then(function (reply) {
    self.password = password;
    return reply;
  });
};

// Set the client's database property to the database number on SELECT.
commands.select = function (database) {
  var self = this;
  return this.send('select', [ database ]).then(function (reply) {
    self.database = parseInt(database, 10);
    return reply;
  });
};

// Set the client's isMonitor property to true on MONITOR.
commands.monitor = function () {
  var self = this;
  return this.send('monitor').then(function (reply) {
    self.isMonitor = true;
    return reply;
  });
};

// Optionally accept a hash as the only argument to MSET.
commands.mset = function (hash) {
  var args = (typeof hash === 'object') ? appendHashToArray(hash, []) : _slice.call(arguments, 0);
  return this.send('mset', args);
};

// Optionally accept a hash as the only argument to MSETNX.
commands.msetnx = function (hash) {
  var args = (typeof hash === 'object') ? appendHashToArray(hash, []) : _slice.call(arguments, 0);
  return this.send('msetnx', args);
};

// Optionally accept a hash as the first argument to HMSET after the key.
commands.hmset = function (key, hash) {
  var args = (typeof hash === 'object') ? appendHashToArray(hash, [ key ]) : _slice.call(arguments, 0);
  return this.send('hmset', args);
};

// Make a hash from the result of HGETALL.
commands.hgetall = function () {
  return this.send('hgetall', _slice.call(arguments, 0)).then(makeHashFromArray);
};

/* helpers */

function appendHashToArray(hash, array) {
  for (var field in hash) {
    if (hash.hasOwnProperty(field)) {
      array.push(field, hash[field]);
    }
  }

  return array;
}

function makeHashFromArray(array) {
  var hash = {};

  for (var i = 0, len = array.length; i < len; i += 2) {
    hash[array[i]] = array[i + 1];
  }

  return hash;
}

function parseInfo(info) {
  var hash = {};

  info.split('\r\n').forEach(function (line) {
    var index = line.indexOf(':');
    if (index !== -1) {
      hash[line.substring(0, index)] = line.substring(index + 1);
    }
  });

  return hash;
}
