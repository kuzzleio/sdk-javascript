var Promise = require('bluebird');

module.exports = Promise.promisifyAll(require('./src/kuzzle'), {
  suffix: 'Promise'
});
