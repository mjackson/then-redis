import expect from 'expect'
import redis from '../index'

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

      subscriber.on('unsubscribe', (channel) => {
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

      subscriber.on('unsubscribe', (channel) => {
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
    it('returns null', () =>
      subscriber.unsubscribe().then((reply) => {
        expect(reply).toEqual(null)
      })
    )
  })
})
