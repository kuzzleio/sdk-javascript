// load the Kuzzle SDK module
const
  {
    Kuzzle,
    WebSocket,
    Http
  } = require('kuzzle-sdk');

const kuzzle = new Kuzzle(
  new WebSocket('kuzzle')
);

[snippet-code]
console.log('Everything is ok');
