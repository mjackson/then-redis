import expect from 'expect'
import db from './db'

describe('hmset', () => {
  it('accepts a list of fields/values as arguments', () => {
    db.hmset('my-key', 'a', 'one', 'b', 'two')

    return db.hgetall('my-key').then((hash) => {
      expect(hash).toEqual({ a: 'one', b: 'two' })
    })
  })

  it('accepts a hash as the second argument', () => {
    db.hmset('my-key', { a: 'one', b: 'two' })

    return db.hgetall('my-key').then((hash) => {
      expect(hash).toEqual({ a: 'one', b: 'two' })
    })
  })
})
