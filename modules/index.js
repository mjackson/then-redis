exports.Client = require('./Client');

exports.createClient = function (options) {
  return new exports.Client(options);
};


exports.usePromise = function (Promise) {
  exports.Client.usePromise(Promise);
}
