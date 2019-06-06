// Loads the Http protocol
const
  {
    Kuzzle,
    Http
  } = require('kuzzle-sdk');

const options = {
  sslConnection: false
};

// Instantiates the Http protocol
const httpProtocol = new Http('kuzzle', options);

// Use it with Kuzzle
const kuzzle = new Kuzzle(httpProtocol);
