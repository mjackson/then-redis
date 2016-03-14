import expect from 'expect'
import db from './db'

describe('mget', () => {
  it('accepts a list of keys as arguments', () => {
    db.mset({ a: 'one', b: 'two' })

    return db.mget('a', 'b').then((list) => {
      expect(list).toEqual([ 'one', 'two' ])
    })
  })

  it('accepts an array of keys as the second argument', () => {
    db.mset({ a: 'one', b: 'two' })

    return db.mget([ 'a', 'b' ]).then((list) => {
      expect(list).toEqual([ 'one', 'two' ])
    })
  })
})
