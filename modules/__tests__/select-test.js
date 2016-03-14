let expect = require('expect')
let redis = require('../index')
let db = require('./db')

describe('select', () => {
  afterEach(() => {
    return db.select(0)
  })

  it('selects the appropriate database', () => {
    return db.select(3).then(() => {
      expect(db.selected_db).toEqual(3)
    })
  })
})
