var
  sinon = require('sinon');

/**
 * @param err
 * @constructor
 */
function NetworkWrapperMock (host, options) {
  var self = this;

  this.host = host;
  this.options = options || {};
  this.port = this.options.port || 7512;
  this.state = 'offline';
  this.connectCalled = false;

  this.removeAllListeners();

  this.connect = function() {
    self.state = 'connecting';
    self.connectCalled = true;
    setTimeout(function () {
      switch (self.host) {
        case 'nowhere':
          self.state = 'error';
          self.emit('networkError', new Error('Mock Error'));
          break;
        case 'somewhereagain':
          self.state = 'connected';
          self.emit('reconnect');
          break;
        default:
          self.state = 'connected';
          self.emit('connect');
      }
    }, 0);
  };

  this.disconnect = function() {
    self.state = 'offline';
    self.emit('disconnect');
  };

  this.send = function (request) {
    self.emit(request.requestId, request.response);
  };

  this.close = sinon.stub();
  this.query = sinon.stub();
  this.playQueue = sinon.stub();
  this.flushQueue = sinon.stub();
  this.startQueuing = sinon.stub();
  this.stopQueuing = sinon.stub();
  this.subscribe = sinon.stub();
  this.unsubscribe = sinon.stub();
}

NetworkWrapperMock.prototype = new (require('events'))();
NetworkWrapperMock.prototype.constructor = NetworkWrapperMock;

module.exports = NetworkWrapperMock;
