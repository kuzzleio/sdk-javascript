const
  Kuzzle = require('./src/Kuzzle'),
  KuzzleAbstractNetwork = require('./src/networkWrapper/protocols/abstract/common'),
  KuzzleEventEmitter = require('./src/eventEmitter');

if (typeof window !== 'undefined' && typeof BUILT === 'undefined') {
  throw new Error('It looks like you are using the Nodejs version of Kuzzle SDK ' +
               'in a browser. ' +
               'It is strongly recommended to use the browser-specific build instead. ' +
               'Learn more at https://github.com/kuzzleio/sdk-javascript/tree/master#browser');
}

module.exports = {Kuzzle, KuzzleAbstractNetwork, KuzzleEventEmitter};
