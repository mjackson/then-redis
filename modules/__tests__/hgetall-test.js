let expect = require('expect')
let db = require('./db')

describe('hgetall', () => {
  beforeEach(() => {
    return db.hmset('my-key', 'a', 'one', 'b', 'two', 'c', 'three')
  })

  it('returns all fields and values of the hash at the given key', () => {
    return db.hgetall('my-key').then((hash) => {
      expect(hash).toEqual({ a: 'one', b: 'two', c: 'three' })
    })
  })
})
