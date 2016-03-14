let assert = require('assert')
let expect = require('expect')
let db = require('./db')

describe('info', () => {
  it('returns an object of info', () => {
    return db.info().then((info) => {
      assert(info)
      expect(typeof info).toEqual('object')
      assert(info.redis_version)
    })
  })
})
