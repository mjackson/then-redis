import assert from 'assert'
import expect from 'expect'
import db from './db'

describe('info', () => {
  it('returns an object of info', () =>
    db.info().then((info) => {
      assert(info)
      expect(typeof info).toEqual('object')
      assert(info.redis_version)
    })
  )
})
