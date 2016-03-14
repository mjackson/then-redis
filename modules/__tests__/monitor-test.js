import expect from 'expect'
import redis from '../index'
import db from './db'

const waitForDelivery = () =>
  new Promise(resolve => {
    setTimeout(resolve, 10)
  })

describe('monitor', () => {
  let monitor
  beforeEach(() => {
    monitor = redis.createClient()
  })

  describe('when monitoring the database', () => {
    let monitorMessages, commands
    beforeEach(() => {
      monitorMessages = []
      commands = [
        [ 'set', 'a', '5' ],
        [ 'incrby', 'a', '6' ],
        [ 'get', 'a' ]
      ]

      monitor.on('monitor', (time, args) => {
        monitorMessages.push(args)
      })

      return monitor.monitor().then((reply) => {
        expect(reply).toEqual('OK')

        // Send all commands in order.
        let result = Promise.resolve()

        commands.forEach((command) => {
          result = result.then(() =>
            db.send(command[0], command.slice(1))
          )
        })

        return result.then(waitForDelivery)
      })
    })

    it('receives a message for all commands in the order they are sent', () => {
      expect(monitorMessages.length).toEqual(commands.length)

      monitorMessages.forEach((args, index) => {
        expect(args).toEqual(commands[index])
      })
    })
  })
})
