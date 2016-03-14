import crypto from 'crypto'
import expect from 'expect'
import db from './db'

describe('keys', () => {
  describe('when there are no keys', () => {
    it('returns an empty array', () =>
      db.keys('*').then((keys) => {
        expect(keys).toEqual([])
      })
    )
  })

  describe('when there are many long keys', () => {
    let hash
    beforeEach(() => {
      hash = {}

      for (let i = 0; i < 200; ++i) {
        const key = crypto.randomBytes(256).toString('hex')
        hash[key] = 'value ' + i
      }

      return db.mset(hash)
    })

    it('returns an array of all keys', () =>
      db.keys('*').then((keys) => {
        expect(keys.sort()).toEqual(Object.keys(hash).sort())
      })
    )
  })
})
