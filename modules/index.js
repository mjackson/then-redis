exports.Client = require('./Client')

exports.createClient = (options) =>
  new exports.Client(options)
