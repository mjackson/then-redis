function appendHashToArray(hash, array) {
  for (var field in hash)
    if (hash.hasOwnProperty(field))
      array.push(field, hash[field]);

  return array;
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

module.exports = {
  appendHashToArray,
  parseInfo
};
