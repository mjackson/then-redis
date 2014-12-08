/*

The promise library defaults to when.js, but can be changed easily:

  var BluebirdPromise = require('bluebird');

  var redis = require('then-redis');
  redis.usePromise(BluebirdPromise);

  var db = redis.createClient();

*/
module.exports = require('when/lib/Promise');
