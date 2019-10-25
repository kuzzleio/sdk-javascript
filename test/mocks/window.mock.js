const
  sinon = require('sinon'),
  KuzzleEventEmitter = require('../../src/eventEmitter');

// A class to mock the global window object
class WindowMock extends KuzzleEventEmitter {
  constructor () {
    super();

    if (typeof window !== 'undefined') {
      throw new Error('Cannot mock add a global "window" object: already defined');
    }

    this.navigator = {
      onLine: true
    };

    this.addEventListener = this.addListener;
    sinon.spy(this, 'addEventListener');
  }

  static restore () {
    delete global.window;
  }

  static inject () {
    Object.defineProperty(global, 'window', {
      value: new this(),
      enumerable: false,
      writable: false,
      configurable: true
    });
  }
}

module.exports = WindowMock;
