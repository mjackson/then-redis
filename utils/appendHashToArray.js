function appendHashToArray(hash, array) {
  for (var field in hash)
    if (hash.hasOwnProperty(field))
      array.push(field, hash[field]);

  return array;
}

module.exports = appendHashToArray;
