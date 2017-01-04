var
  bluebird = require('bluebird'),
  Kuzzle = require('./src/Kuzzle');

// Adds on the fly methods promisification
Kuzzle.prototype.bluebird = bluebird;

module.exports = Kuzzle;
