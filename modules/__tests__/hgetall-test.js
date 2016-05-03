import expect from 'expect'
import db from './db'

describe('hgetall', () => {
  beforeEach(() =>
    db.hmset('my-key', 'a', 'one', 'b', 'two', 'c', 'three')
  )

  it('returns all fields and values of the hash at the given key', () =>
    db.hgetall('my-key').then(hash => {
      expect(hash.a).toEqual('one')
      expect(hash.b).toEqual('two')
      expect(hash.c).toEqual('three')
    })
  )
})
