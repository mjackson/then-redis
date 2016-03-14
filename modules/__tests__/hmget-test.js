import expect from 'expect'
import db from './db'

describe('hmget', () => {
  it('returns an array of values for the given keys', () => {
    db.hmset('my-key', 'a', 'one', 'b', 'two', 'c', 'three')

    return db.hmget('my-key', 'a', 'b').then((array) => {
      expect(array).toEqual([ 'one', 'two' ])
    })
  })
})
