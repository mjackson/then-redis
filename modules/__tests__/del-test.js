let expect = require('expect')
let db = require('./db')

describe('del', () => {
  describe('when a key does not exist', () => {
    it('returns 0 removed keys', () => {
      return db.del('does-not-exist').then((reply) => {
        expect(reply).toBe(0)
      })
    })
  })

  describe('when a key exists', () => {
    let key, expectedReply
    beforeEach(() => {
      key = 'a-key'
      expectedReply = 1
      return db.set(key, 'hello world')
    })

    it('returns successfully removed count of 1', () => {
      return db.del(key).then((reply) => {
        expect(reply).toBe(expectedReply)
      })
    })
  })

  describe('when multiple keys exist', () => {
    let key1, key2, key3, expectedReply
    beforeEach(() => {
      key1 = 'a-key-1'
      key2 = 'a-key-2'
      key3 = 'a-key-3'
      expectedReply = 3
      db.set(key1, 'hello world')
      db.set(key2, 'hello world2')
      db.set(key3, 'hello world3')
    })

    it('using multiple params, it should return successfully removed count', () => {
      return db.del(key1, key2, key3).then((reply) => {
        expect(reply).toBe(expectedReply)
      })
    })

    it('using an array as the param, it should return successfully removed count', () => {
      return db.del([ key1, key2, key3 ]).then((reply) => {
        expect(reply).toBe(expectedReply)
      })
    })
  })
})
