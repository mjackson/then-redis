var assert = require('assert');
var expect = require('expect');
var redis = require('../index');

describe('when using Promises and specifying no library', function () {
  var db;
  beforeEach(function () {
    db = redis.createClient();
  });

  afterEach(function () {
    return db.flushdb();
  });

  it('when.js is used', function () {
    var WhenPromise = require('when/lib/Promise');
    var promise = db.ping();
    expect(promise).toBeA(WhenPromise);
  });
});


describe('when using Promises and specifying another Promise constructor', function () {

  before(function () {
    var BluebirdPromise = require('bluebird');
    redis.usePromise(BluebirdPromise);
  });

  var db;
  beforeEach(function () {
    db = redis.createClient();
  });

  afterEach(function () {
    return db.flushdb();
  });

  it('the specified constructor is used', function () {
    var BluebirdPromise = require('bluebird');
    var promise = db.ping();
    expect(promise).toBeA(BluebirdPromise);
  });
});
