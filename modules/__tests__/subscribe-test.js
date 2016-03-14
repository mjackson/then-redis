import expect from 'expect'
import redis from '../index'
import db from './db'

const waitForDelivery = () =>
  new Promise(resolve => {
    setTimeout(resolve, 10)
  })

describe('subscribe', () => {
  let subscriber
  beforeEach(() => {
    subscriber = redis.createClient()
  })

  // Sends the given messages in order to the given channel.
  const sendMessages = (channel, messages) => {
    const messagesCopy = messages.slice(0)
    const initialResult = db.publish(channel, messagesCopy.shift())

    return messagesCopy.reduce(
      (result, message) => result.then(() => db.publish(channel, message)),
      initialResult
    )
  }

  describe('when subscribing to a channel', () => {
    let receivedMessages, sentMessages
    beforeEach(() => {
      receivedMessages = []
      sentMessages = [ 'a', 'b', 'c' ]

      subscriber.on('message', (channel, message) => {
        receivedMessages.push(message)
      })

      return subscriber.subscribe('a').then(
        () => sendMessages('a', sentMessages).then(waitForDelivery)
      )
    })

    it('streams messages that are sent to that channel', () => {
      expect(receivedMessages).toEqual(sentMessages)
    })

    it('sets the pub_sub_mode-flag', () => {
      expect(subscriber.pub_sub_mode).toEqual(true)
    })
  })

  describe('when subscribing to many channels', () => {
    let aReceivedMessages, bReceivedMessages
    let aSentMessages, bSentMessages
    beforeEach(() => {
      aReceivedMessages = []
      bReceivedMessages = []
      aSentMessages = [ 'a', 'b', 'c' ]
      bSentMessages = [ 'd', 'e', 'f' ]

      subscriber.on('message', (channel, message) => {
        if (channel === 'a') aReceivedMessages.push(message)
        if (channel === 'b') bReceivedMessages.push(message)
      })

      return Promise.all([
        subscriber.subscribe('a'),
        subscriber.subscribe('b')
      ]).then(
        () => Promise.all([
          sendMessages('a', aSentMessages),
          sendMessages('b', bSentMessages)
        ]).then(waitForDelivery)
      )
    })

    it('streams messages that are sent to any of those channels', () => {
      expect(aReceivedMessages).toEqual(aSentMessages)
      expect(bReceivedMessages).toEqual(bSentMessages)
    })
  })
})
