let expect = require('expect')
let db = require('./db')

describe('getset', () => {
  describe('when a key does not exist', () => {
    it('returns null', () => {
      return db.getset('does-not-exist', 'hello world').then((reply) => {
        expect(reply).toBe(null)
      })
    })
  })

  describe('when a key exists', () => {
    let key, expectedReply
    beforeEach(() => {
      key = 'a-key'
      expectedReply = 'hello world'
      return db.set(key, expectedReply)
    })

    it('returns its value and sets the new value', () => {
      return db.getset(key, 'another value').then((reply) => {
        expect(reply).toBe(expectedReply)
        return db.get(key).then((reply) => {
          expect(reply).toBe('another value')
        })
      })
    })
  })
})
