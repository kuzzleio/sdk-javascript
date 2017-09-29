var
  NetworkWrapperMock = require('./networkWrapper.mock'),
  sinon = require('sinon');

/**
 * @param err
 * @constructor
 */
function KuzzleMock () {
  this.headers = {};
  this.network = new NetworkWrapperMock();

  this.query = sinon.stub();
  this.subscribe = sinon.stub();
  this.unsubscribe = sinon.stub();

  this.addHeaders = function(query, headers) {
    Object.keys(headers).forEach(function (header) {
      if (!query[header]) {
        query[header] = headers[header];
      }
    });
    return query;
  };

  this.callbackRequired = function (errorMessagePrefix, callback) {
    if (!callback || typeof callback !== 'function') {
      throw new Error(errorMessagePrefix + ': a callback argument is required for read queries');
    }
  };
}

KuzzleMock.prototype = new (require('events'))();
KuzzleMock.prototype.constructor = KuzzleMock;

KuzzleMock.prototype.setHeaders = function (content, replace) {
  var self = this;

  if (replace) {
    self.headers = content;
  } else {
    Object.keys(content).forEach(function (key) {
      self.headers[key] = content[key];
    });
  }

  return self;
};

module.exports = KuzzleMock;

