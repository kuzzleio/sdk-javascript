var
  bluebird = require('bluebird'),
  Kuzzle = require('./src/Kuzzle');

// Adds on the fly methods promisification
Kuzzle.prototype.bluebird = bluebird;

if (typeof window !== 'undefined' && typeof BUILT === 'undefined') {
  throw new Error('It looks like you are using the Nodejs version of Kuzzle SDK ' +
               'in a browser. ' +
               'It is strongly recommended to use the browser-specific build instead. ' +
               'Learn more at https://github.com/kuzzleio/sdk-javascript/tree/master#browser');
}

module.exports = Kuzzle;
