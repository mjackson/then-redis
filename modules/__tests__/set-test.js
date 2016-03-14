import expect from 'expect'
import db from './db'

describe('set', () => {
  let key, expectedReply
  beforeEach(() => {
    key = 'a-key'
    expectedReply = 'hello world'
    return db.set(key, expectedReply)
  })

  it('sets the value of a key', () =>
    db.get(key).then((reply) => {
      expect(reply).toBe(expectedReply)
    })
  )
})
