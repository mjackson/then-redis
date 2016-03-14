import expect from 'expect'
import db from './db'

describe('select', () => {
  afterEach(() =>
    db.select(0)
  )

  it('selects the appropriate database', () =>
    db.select(3).then(() => {
      expect(db.selected_db).toEqual(3)
    })
  )
})
