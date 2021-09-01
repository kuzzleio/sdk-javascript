// Loads the Http protocol
const
  {
    Kuzzle,
    Http
  } = require('kuzzle-sdk');

const customRoutes = {
  'nyc-open-data-plugin/driver': {
    enroll: { verb: 'POST', url: '/_plugin/nyc-open-data-plugin/drivers' },
    remove: { verb: 'DELETE', url: '/_plugin/nyc-open-data-plugin/drivers/:driverId' }
  }
};

const headers = {
  'Accept-Encoding': 'gzip, deflate'
};

const options = {
  customRoutes,
  headers,
  sslConnection: false
};

// Instantiates the Http protocol
const httpProtocol = new Http('kuzzle', options);

// Use it with Kuzzle
const kuzzle = new Kuzzle(httpProtocol);
