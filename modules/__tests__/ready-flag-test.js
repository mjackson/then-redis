let expect = require('expect')
let redis = require('../index')

describe('ready-flag', () => {
  let client
  beforeEach(() => {
    client = redis.createClient()
  })

  it('is set on ready', (done) => {
    client.on('ready', () => {
      expect(client.ready).toEqual(true)
      done()
    })
  })
})
