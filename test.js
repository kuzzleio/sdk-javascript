const {
  Kuzzle,
  WebSocket
} = require('kuzzle-sdk');

const kuzzle = new Kuzzle(
  new WebSocket('kuzzle')
);

(async () => {
  try {
    await kuzzle.connect();
    await kuzzle.document.create('index', 'collection', { foo: 'bar' }, 42)
  } catch (error) {
    console.error(error)
  }
})()
