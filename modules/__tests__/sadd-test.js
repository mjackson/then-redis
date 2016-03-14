import expect from 'expect'
import db from './db'

describe('sadd', () => {
  it('returns the number of items added to a set', () =>
    db.sadd('my-set', 1, 2, 3, 3, 4, 4, 4).then((numItemsAdded) => {
      expect(numItemsAdded).toBe(4)
    })
  )
})
