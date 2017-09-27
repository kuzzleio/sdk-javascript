/**
 * @param err
 * @constructor
 */
function NetworkWrapperMock (host, port, sslConnection) {
  var self = this;

  this.host = host;
  this.port = port;
  this.sslConnection = sslConnection;
  this.connectCalled = false;

  this.removeAllListeners();

  this.connect = function() {
    this.connectCalled = true;
    process.nextTick(function () {
      switch (self.host) {
        case 'nowhere':
          self.emit('networkError', new Error('Mock Error'));
          break;
        case 'somewhereagain':
          self.emit('reconnect');
          break;
        default:
          self.emit('connect');
      }
    });
  };

  this.disconnect = function() {
    self.emit('disconnect');
  };

  this.onConnect = function (callback) {
    this.addListener('connect', callback);
  };

  this.onConnectError = function (callback) {
    this.addListener('networkError', callback);
  };

  this.onDisconnect = function (callback) {
    this.addListener('disconnect', callback);
  };

  this.onReconnect = function (callback) {
    this.addListener('reconnect', callback);
  };

  this.send = function (request) {
    self.emit(request.requestId, request.response);
  };

  this.close = function () {
    this.removeAllListeners();
  };

}

NetworkWrapperMock.prototype = new (require('events'))();
NetworkWrapperMock.prototype.constructor = NetworkWrapperMock;

module.exports = NetworkWrapperMock;
