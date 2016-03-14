import assert from 'assert'
import expect from 'expect'
import db from './db'

describe('incr', () => {
  describe('when a key does not exist', () => {
    it('returns 1', () =>
      db.incr('does-not-exist').then((reply) => {
        expect(reply).toBe(1)
      })
    )
  })

  describe('when a key contains an integer', () => {
    beforeEach(() =>
      db.set('a-key', 5)
    )

    it('returns the incremented value', () =>
      db.incr('a-key').then((reply) => {
        expect(reply).toBe(6)
      })
    )
  })

  describe('when a key does not contain an integer', () => {
    beforeEach(() =>
      db.set('a-key', 'abc')
    )

    it('returns an error', () =>
      db.incr('a-key').then(() => {
        assert(false, 'incr succeeded on a non-integer key')
      }, (error) => {
        assert(error)
        expect(error.message).toMatch(/not an integer/)
      })
    )
  })
})
