let assert = require('assert')
let expect = require('expect')
let db = require('./db')

describe('transactions', () => {
  describe('when there is no error inside a transaction', () => {
    it('executes the transaction successfully', () => {
      db.multi()
      db.incr('a')
      db.incr('b')
      return db.exec().then((reply) => {
        expect(reply).toEqual([ 1, 1 ])
      })
    })
  })

  describe('when there is an error executing the transaction', () => {
    it('returns the error', () => {
      db.multi()
      db.set('a', 'hello')
      db.incr('a')
      return db.exec().then((reply) => {
        expect(reply.length).toEqual(2)
        expect(reply[1].message).toMatch(/ERR value is not an integer or out of range/)
      })
    })
  })

  describe('when there is an error enqueueing the transaction', () => {
    it('throws the error', () => {
      db.multi()
      return db.send('unknown-command').then(() => {
        assert(false, 'successfully queued non-existent command')
      }, (error) => {
        assert(error)
        return db.discard()
      })
    })
  })
})
