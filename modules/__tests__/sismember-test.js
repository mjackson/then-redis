import expect from 'expect'
import db from './db'

describe('sismember', () => {
  beforeEach(() =>
    db.sadd('my-key', 1, 2, 3)
  )

  it('returns 1 when the set at the given key contains a member', () =>
    db.sismember('my-key', 2).then((reply) => {
      expect(reply).toBe(1)
    })
  )

  it('returns 0 when the set at the given key does not contain a member', () =>
    db.sismember('my-key', 4).then((reply) => {
      expect(reply).toBe(0)
    })
  )
})
