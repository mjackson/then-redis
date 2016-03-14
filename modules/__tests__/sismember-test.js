let expect = require('expect')
let db = require('./db')

describe('sismember', () => {
  beforeEach(() => {
    return db.sadd('my-key', 1, 2, 3)
  })

  it('returns 1 when the set at the given key contains a member', () => {
    return db.sismember('my-key', 2).then((reply) => {
      expect(reply).toBe(1)
    })
  })

  it('returns 0 when the set at the given key does not contain a member', () => {
    return db.sismember('my-key', 4).then((reply) => {
      expect(reply).toBe(0)
    })
  })
})
