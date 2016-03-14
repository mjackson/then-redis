let assert = require('assert')
let redis = require('../index')
let db = require('./db')

describe('when a server requires auth', () => {
  let password = 'secret'
  beforeEach(() => {
    return db.config('set', 'requirepass', password).then(() => {
      return db.auth(password)
    })
  })

  afterEach(() => {
    return db.config('set', 'requirepass', '')
  })

  describe('a new client with the correct password', () => {
    let client
    beforeEach(() => {
      client = redis.createClient({ host: db.host, port: db.port, password: password })
    })

    it('does not throw when commands are issued', () => {
      return client.get('a-key')
    })
  })

  describe('a new client with the wrong password', () => {
    it('throws when commands are issued', (done) => {
      let client = redis.createClient({ host: db.host, port: db.port })

      client.on('error', (error) => {
        assert(error)
        done()
      })
    })
  })
})
