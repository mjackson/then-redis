let expect = require('expect')
let redis = require('../index')

describe('quit', () => {
  let quitter
  beforeEach(() => {
    quitter = redis.createClient()
  })

  it('emits the "end" event', (done) => {
    quitter.on('end', done)
    quitter.quit()
  })

  it('unsets the connected-flag', (done) => {
    quitter.on('end', () => {
      expect(quitter.connected).toEqual(false)
      done()
    })
    quitter.quit()
  })
})
