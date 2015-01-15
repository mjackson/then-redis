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

module.exports = parseInfo;
