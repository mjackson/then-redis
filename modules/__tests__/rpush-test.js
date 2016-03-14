import expect from 'expect'
import db from './db'

describe('rpush', () => {
  it('accepts a list of values as arguments', () => {
    db.rpush('my-key', 'a', 'b', 'c')

    return db.lrange('my-key', 0, -1).then((list) => {
      expect(list).toEqual([ 'a', 'b', 'c' ])
    })
  })

  it('accepts an array as the second argument', () => {
    db.rpush('my-key', [ 'a', 'b', 'c' ])

    return db.lrange('my-key', 0, -1).then((list) => {
      expect(list).toEqual([ 'a', 'b', 'c' ])
    })
  })
})
