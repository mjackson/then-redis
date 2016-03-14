let assert = require('assert')
let expect = require('expect')
let redis = require('../index')

describe('when returning buffers', () => {
  let db
  beforeEach(() => {
    db = redis.createClient({ return_buffers: true })
  })

  afterEach(() => {
    return db.flushdb()
  })

  describe('a bulk reply (using get)', () => {
    describe('when a key exists', () => {
      beforeEach(() => {
        return db.set('a-key', 'a value')
      })

      it('returns a buffer', () => {
        return db.get('a-key').then((reply) => {
          assert(Buffer.isBuffer(reply))
          expect(reply.toString()).toEqual('a value')
        })
      })
    })

    describe('when a key does not exist', () => {
      it('returns null', () => {
        return db.get('a-key').then((reply) => {
          expect(reply).toBe(null)
        })
      })
    })
  })

  describe('a multi-bulk reply (using mget)', () => {
    beforeEach(() => {
      return db.mset({
        'a-key': 'a value',
        'b-key': 'b value'
      })
    })

    describe('when all keys exist', () => {
      it('returns buffers', () => {
        return db.mget('a-key', 'b-key').then((reply) => {
          assert(Array.isArray(reply))
          assert(Buffer.isBuffer(reply[0]))
          assert(Buffer.isBuffer(reply[1]))
        })
      })
    })

    describe('when keys do not exist', () => {
      it('returns null', () => {
        return db.mget('a-key', 'c-key').then((reply) => {
          assert(Array.isArray(reply))
          assert(Buffer.isBuffer(reply[0]))
          expect(reply[1]).toBe(null)
        })
      })
    })
  })
})
