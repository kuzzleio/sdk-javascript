const {
  Kuzzle,
  WebSocket
} = require('./index')

const kuzzle = new Kuzzle(new WebSocket('localhost'))

const run = async () => {
  await kuzzle.connect()


  console.log(await kuzzle.collection.getMapping('sz', 'zzzz', { includeKuzzleMeta: true }))
}

run()