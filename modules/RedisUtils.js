const appendHashToArray = (hash, array) => {
  for (const field in hash)
    if (hash.hasOwnProperty(field))
      array.push(field, hash[field])

  return array
}

const parseInfo = (info) => {
  const hash = {}

  info.split('\r\n').forEach(line => {
    const index = line.indexOf(':')

    if (index !== -1) {
      const name = line.substring(0, index)
      hash[name] = line.substring(index + 1)
    }
  })

  return hash
}

module.exports = {
  appendHashToArray,
  parseInfo
}
