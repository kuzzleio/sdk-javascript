var
  NetworkWrapperMock = require('./networkWrapper.mock'),
  sinon = require('sinon'),
  Security = require('../../src/security/Security.js');

/**
 * @param err
 * @constructor
 */
function KuzzleMock () {
  this.network = new NetworkWrapperMock();

  this.query = sinon.stub();
  this.subscribe = sinon.stub();
  this.unsubscribe = sinon.stub();
  this.security = new Security(this);
  this.setJwt = sinon.stub();
  this.unsetJwt = sinon.stub();
  this.emit = sinon.stub();

  this.callbackRequired = function (errorMessagePrefix, callback) {
    if (!callback || typeof callback !== 'function') {
      throw new Error(errorMessagePrefix + ': a callback argument is required for read queries');
    }
  };
}

KuzzleMock.prototype = new (require('events'))();
KuzzleMock.prototype.constructor = KuzzleMock;

module.exports = KuzzleMock;
