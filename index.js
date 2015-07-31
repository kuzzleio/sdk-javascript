var Promise = require('bluebird');

module.exports = Promise.promisifyAll(require('./lib/kuzzle.js'), {
  suffix: 'Promise'
});
