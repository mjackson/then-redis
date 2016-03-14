let expect = require('expect')
let redis = require('../index')
let db = require('./db')

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
          result = result.then(() => {
            return db.send(command[0], command.slice(1))
          })
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

const waitForDelivery = () => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 10)
  })
}
