// load the Kuzzle SDK module
const
  {
    Kuzzle,
    WebSocket,
    Http
  } = require('kuzzle-sdk');

const kuzzle = new Kuzzle(
  new WebSocket('kuzzle', { pingInterval: 2000 })
);

[snippet-code]
console.log('Everything is ok');
