import expect from 'expect'
import redis from '../index'

// Note: Use this instance in all tests.
const db = redis.createClient()

beforeEach(() =>
  db.flushdb().then((reply) => {
    expect(reply).toEqual('OK')
  })
)

module.exports = db
