let expect = require('expect')
let db = require('./db')

describe('scard', () => {
  describe('when a set is empty', () => {
    it('returns 0', () => {
      return db.scard('my-set').then((cardinality) => {
        expect(cardinality).toBe(0)
      })
    })
  })

  describe('when a set has 4 members', () => {
    it('returns the cardinality of the set', () => {
      return db.sadd('my-set', 1, 2, 3, 4).then((numItemsAdded) => {
        expect(numItemsAdded).toBe(4)
        return db.scard('my-set').then((cardinality) => {
          expect(cardinality).toBe(4)
        })
      })
    })
  })
})
