import assert from 'assert'
import redis from '../index'
import db from './db'

describe('when a server requires auth', () => {
  const password = 'secret'

  beforeEach(() =>
    db.config('set', 'requirepass', password).then(() =>
      db.auth(password)
    )
  )

  afterEach(() =>
    db.config('set', 'requirepass', '')
  )

  describe('a new client with the correct password', () => {
    it('does not throw when commands are issued', () => {
      const client = redis.createClient({ host: db.host, port: db.port, password })
      return client.get('a-key')
    })
  })

  describe('a new client with the wrong password', () => {
    it('throws when commands are issued', (done) => {
      const client = redis.createClient({ host: db.host, port: db.port })

      client.on('error', (error) => {
        assert(error)
        done()
      })
    })
  })
})
