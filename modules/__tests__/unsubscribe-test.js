let expect = require('expect')
let redis = require('../index')
let db = require('./db')

describe('when subscribed to many channels', () => {
  let channels, subscriber
  beforeEach(() => {
    channels = [ 'abc', 'def' ]
    subscriber = redis.createClient()
    return subscriber.subscribe.apply(subscriber, channels)
  })

  describe('unsubscribing from a channel', () => {
    let unsubscribedChannel
    beforeEach((done) => {
      unsubscribedChannel = null

      subscriber.on('unsubscribe', (channel, numSubscriptions) => {
        unsubscribedChannel = channel
        done()
      })

      subscriber.unsubscribe('abc')
    })

    it('emits the channel name', () => {
      expect(unsubscribedChannel).toEqual('abc')
    })
  })

  describe('unsubscribing from all channels', () => {
    let unsubscribedChannels
    beforeEach((done) => {
      unsubscribedChannels = []

      subscriber.on('unsubscribe', (channel, numSubscriptions) => {
        unsubscribedChannels.push(channel)

        if (unsubscribedChannels.length === channels.length)
          done()
      })

      subscriber.unsubscribe()
    })

    it('emits all channel names', () => {
      expect(unsubscribedChannels.sort()).toEqual(channels.sort())
    })

    it('unsets the pub_sub_mode-flag', () => {
      expect(subscriber.pub_sub_mode).toEqual(false)
    })
  })
})

describe('when subscribed to no channels', () => {
  let subscriber
  beforeEach(() => {
    subscriber = redis.createClient()
  })

  describe('unsubscribing from all channels', () => {
    it('returns null', () => {
      return subscriber.unsubscribe().then((reply) => {
        expect(reply).toEqual(null)
      })
    })
  })
})
