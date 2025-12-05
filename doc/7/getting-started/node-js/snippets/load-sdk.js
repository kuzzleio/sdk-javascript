const { Kuzzle, WebSocket } = require("kuzzle-sdk");

// Replace 'kuzzle' with your Kuzzle server hostname (e.g. 'localhost')
// eslint-disable-next-line no-unused-vars
const kuzzle = new Kuzzle(new WebSocket("kuzzle"));
