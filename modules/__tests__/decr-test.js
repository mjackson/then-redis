import assert from 'assert'
import expect from 'expect'
import db from './db'

describe('decr', () => {
  describe('when a key does not exist', () => {
    it('returns -1', () =>
      db.decr('does-not-exist').then((reply) => {
        expect(reply).toBe(-1)
      })
    )
  })

  describe('when a key contains an integer', () => {
    beforeEach(() =>
      db.set('a-key', 5)
    )

    it('returns the decremented value', () =>
      db.decr('a-key').then((reply) => {
        expect(reply).toBe(4)
      })
    )
  })

  describe('when a key does not contain an integer', () => {
    beforeEach(() =>
      db.set('a-key', 'abc')
    )

    it('returns an error', () =>
      db.decr('a-key').then(() => {
        assert(false, 'decr succeeded on a non-integer key')
      }, (error) => {
        assert(error)
        expect(error.message).toMatch(/not an integer/)
      })
    )
  })
})
