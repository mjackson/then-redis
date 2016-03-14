import expect from 'expect'
import redis from '../index'

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
