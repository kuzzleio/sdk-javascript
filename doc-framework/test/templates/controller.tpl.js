// load the Kuzzle SDK module
const
  {
    Kuzzle,
    WebSocket,
    BaseController
  } = require('kuzzle-sdk');

BaseController.prototype.query = () => Promise.resolve(null);

[snippet-code]
