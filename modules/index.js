exports.Client = require('./Client');

exports.createClient = function (options) {
  return new exports.Client(options);
};
