import expect from 'expect'
import redis from '../index'

describe('connection-flag', () => {
  let client
  beforeEach(() => {
    client = redis.createClient()
  })

  it('is set on connect', (done) => {
    client.on('connect', () => {
      expect(client.connected).toEqual(true)
      done()
    })
  })
})
