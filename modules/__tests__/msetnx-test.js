let expect = require('expect')
let db = require('./db')

describe('msetnx', () => {
  describe('when some of the keys already exist', () => {
    beforeEach(() => {
      return db.set('a', 'one')
    })

    it('returns 0', () => {
      return db.msetnx('a', 'one', 'b', 'two', 'c', 'three').then((reply) => {
        expect(reply).toBe(0)
      })
    })
  })

  describe('when none of the keys already exist', () => {

    describe('when given a list of fields/values', () => {
      it('sets all keys to the correct values', () => {
        return db.msetnx('a', 'one', 'b', 'two', 'c', 'three').then(() => {
          return db.mget('a', 'b', 'c').then((values) => {
            expect(values).toEqual([ 'one', 'two', 'three' ])
          })
        })
      })
    })

    describe('when given a hash', () => {
      it('sets all keys to the correct values', () => {
        return db.msetnx({ a: 'one', b: 'two', c: 'three' }).then(() => {
          return db.mget('a', 'b', 'c').then((values) => {
            expect(values).toEqual([ 'one', 'two', 'three' ])
          })
        })
      })
    })

  })
})
