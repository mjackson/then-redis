let expect = require('expect')
let db = require('./db')

describe('mset', () => {
  describe('when given a list of fields/values', () => {
    it('sets all keys to the correct values', () => {
      return db.mset('a', 'one', 'b', 'two', 'c', 'three').then(() => {
        return db.mget('a', 'b', 'c').then((values) => {
          expect(values).toEqual([ 'one', 'two', 'three' ])
        })
      })
    })
  })

  describe('when given a hash', () => {
    it('sets all keys to the correct values', () => {
      return db.mset({ a: 'one', b: 'two', c: 'three' }).then(() => {
        return db.mget('a', 'b', 'c').then((values) => {
          expect(values).toEqual([ 'one', 'two', 'three' ])
        })
      })
    })
  })
})
