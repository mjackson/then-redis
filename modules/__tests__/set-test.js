let expect = require('expect')
let db = require('./db')

describe('set', () => {
  let key, expectedReply
  beforeEach(() => {
    key = 'a-key'
    expectedReply = 'hello world'
    return db.set(key, expectedReply)
  })

  it('sets the value of a key', () => {
    return db.get(key).then((reply) => {
      expect(reply).toBe(expectedReply)
    })
  })
})
