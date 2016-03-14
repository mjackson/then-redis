import expect from 'expect'
import db from './db'

describe('getset', () => {
  describe('when a key does not exist', () => {
    it('returns null', () =>
      db.getset('does-not-exist', 'hello world').then((reply) => {
        expect(reply).toBe(null)
      })
    )
  })

  describe('when a key exists', () => {
    let key, expectedReply
    beforeEach(() => {
      key = 'a-key'
      expectedReply = 'hello world'
      return db.set(key, expectedReply)
    })

    it('returns its value and sets the new value', () =>
      db.getset(key, 'another value').then((getSetReply) => {
        expect(getSetReply).toBe(expectedReply)
        return db.get(key).then((getReply) => {
          expect(getReply).toBe('another value')
        })
      })
    )
  })
})
