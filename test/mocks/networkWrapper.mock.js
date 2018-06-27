const
  sinon = require('sinon'),
  KuzzleEventEmitter = require('../../src/eventEmitter');

class NetworkWrapperMock extends KuzzleEventEmitter {

  constructor (options = {}) {
    super();

    this.options = options || {};
    this.host = this.options.host;
    this.port = this.options.port || 7512;
    this.state = 'offline';
    this.connectCalled = false;

    this.close = sinon.stub();
    this.query = sinon.stub();
    this.playQueue = sinon.stub();
    this.flushQueue = sinon.stub();
    this.startQueuing = sinon.stub();
    this.stopQueuing = sinon.stub();
    this.subscribe = sinon.stub();
    this.unsubscribe = sinon.stub();
    this.isReady = sinon.stub();

    this.removeAllListeners();
  }

  connect () {
    this.state = 'connecting';
    this.connectCalled = true;
    return new Promise((resolve, reject) => {
      const error = new Error('Mock Error');
      switch (this.host) {
        case 'nowhere':
          this.state = 'error';
          this.emit('networkError', error);
          reject(error);
          break;
        case 'somewhereagain':
          this.state = 'connected';
          this.emit('reconnect');
          resolve();
          break;
        default:
          this.state = 'connected';
          this.emit('connect');
          resolve();
      }
    });
  }

  disconnect () {
    this.state = 'offline';
    this.emit('disconnect');
  }

  send (request) {
    this.emit(request.requestId, request.response);
  }
}

module.exports = NetworkWrapperMock;
