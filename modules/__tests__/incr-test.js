let assert = require('assert')
let expect = require('expect')
let db = require('./db')

describe('incr', () => {
  describe('when a key does not exist', () => {
    it('returns 1', () => {
      return db.incr('does-not-exist').then((reply) => {
        expect(reply).toBe(1)
      })
    })
  })

  describe('when a key contains an integer', () => {
    beforeEach(() => {
      return db.set('a-key', 5)
    })

    it('returns the incremented value', () => {
      return db.incr('a-key').then((reply) => {
        expect(reply).toBe(6)
      })
    })
  })

  describe('when a key does not contain an integer', () => {
    beforeEach(() => {
      return db.set('a-key', 'abc')
    })

    it('returns an error', () => {
      return db.incr('a-key').then(() => {
        assert(false, 'incr succeeded on a non-integer key')
      }, (error) => {
        assert(error)
        expect(error.message).toMatch(/not an integer/)
      })
    })
  })
})
