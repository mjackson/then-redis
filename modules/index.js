exports.Client = require('./client');

exports.createClient = function (options) {
  return new exports.Client(options);
};
