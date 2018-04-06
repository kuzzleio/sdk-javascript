const
  should = require('should'),
  proxyquire = require('proxyquire'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock');

const Kuzzle = proxyquire('../../src/Kuzzle', {
  './networkWrapper': function(protocol, host, options) {
    return new NetworkWrapperMock(host, options);
  }
});

describe('Kuzzle getters', () => {
  let kuzzle;

  beforeEach(() => {
    kuzzle = new Kuzzle('somewhere');
  });

  it('should get "autoQueue" property from network instance', () => {
    kuzzle.network.autoQueue = 'foo-bar';
    should(kuzzle.autoQueue).be.equal('foo-bar');
  });

  it('should get "autoReconnect" property from network instance', () => {
    kuzzle.network.autoReconnect = 'foo-bar';
    should(kuzzle.autoReconnect).be.equal('foo-bar');
  });

  it('should get "autoReplay" property from network instance', () => {
    kuzzle.network.autoReplay = 'foo-bar';
    should(kuzzle.autoReplay).be.equal('foo-bar');
  });

  it('should get "jwt" property from private _jwt one', () => {
    kuzzle._jwt = 'foo-bar';
    should(kuzzle.jwt).be.equal('foo-bar');
  });

  it('should get "host" property from network instance', () => {
    kuzzle.network.host = 'foo-bar';
    should(kuzzle.host).be.equal('foo-bar');
  });

  it('should get "offlineQueue" property from network instance', () => {
    kuzzle.network.offlineQueue = 'foo-bar';
    should(kuzzle.offlineQueue).be.equal('foo-bar');
  });

  it('should get "offlineQueueLoader" property from network instance', () => {
    kuzzle.network.offlineQueueLoader = 'foo-bar';
    should(kuzzle.offlineQueueLoader).be.equal('foo-bar');
  });

  it('should get "port" property from network instance', () => {
    kuzzle.network.port = 'foo-bar';
    should(kuzzle.port).be.equal('foo-bar');
  });

  it('should get "queueFilter" property from network instance', () => {
    kuzzle.network.queueFilter = 'foo-bar';
    should(kuzzle.queueFilter).be.equal('foo-bar');
  });

  it('should get "queueMaxSize" property from network instance', () => {
    kuzzle.network.queueMaxSize = 'foo-bar';
    should(kuzzle.queueMaxSize).be.equal('foo-bar');
  });

  it('should get "queueTTL" property from network instance', () => {
    kuzzle.network.queueTTL = 'foo-bar';
    should(kuzzle.queueTTL).be.equal('foo-bar');
  });

  it('should get "reconnectionDelay" property from network instance', () => {
    kuzzle.network.reconnectionDelay = 'foo-bar';
    should(kuzzle.reconnectionDelay).be.equal('foo-bar');
  });

  it('should get "replayInterval" property from network instance', () => {
    kuzzle.network.replayInterval = 'foo-bar';
    should(kuzzle.replayInterval).be.equal('foo-bar');
  });

  it('should get "sslConnection" property from network instance', () => {
    kuzzle.network.sslConnection = 'foo-bar';
    should(kuzzle.sslConnection).be.equal('foo-bar');
  });
});