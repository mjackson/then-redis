let crypto = require('crypto')
let expect = require('expect')
let db = require('./db')

describe('keys', () => {
  describe('when there are no keys', () => {
    it('returns an empty array', () => {
      return db.keys('*').then((keys) => {
        expect(keys).toEqual([])
      })
    })
  })

  describe('when there are many long keys', () => {
    let hash
    beforeEach(() => {
      hash = {}

      let key
      for (let i = 0; i < 200; ++i) {
        key = crypto.randomBytes(256).toString('hex')
        hash[key] = 'value ' + i
      }

      return db.mset(hash)
    })

    it('returns an array of all keys', () => {
      return db.keys('*').then((keys) => {
        expect(keys.sort()).toEqual(Object.keys(hash).sort())
      })
    })
  })
})
