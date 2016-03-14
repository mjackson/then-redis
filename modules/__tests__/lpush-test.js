let expect = require('expect')
let db = require('./db')

describe('lpush', () => {
  it('accepts a list of values as arguments', () => {
    db.lpush('my-key', 'c', 'b', 'a')

    return db.lrange('my-key', 0, -1).then((list) => {
      expect(list).toEqual([ 'a', 'b', 'c' ])
    })
  })

  it('accepts an array as the second argument', () => {
    db.lpush('my-key', [ 'c', 'b', 'a' ])

    return db.lrange('my-key', 0, -1).then((list) => {
      expect(list).toEqual([ 'a', 'b', 'c' ])
    })
  })
})
