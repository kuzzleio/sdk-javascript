const
  should = require('should'),
  ProtocolMock = require('../mocks/protocol.mock'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle getters', () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock({host: 'somewhere'});
    kuzzle = new Kuzzle(protocol);
  });

  it('should get "autoQueue" property from protocol instance', () => {
    kuzzle.protocol.autoQueue = 'foo-bar';
    should(kuzzle.autoQueue).be.equal('foo-bar');
  });

  it('should get "autoReconnect" property from protocol instance', () => {
    kuzzle.protocol.autoReconnect = 'foo-bar';
    should(kuzzle.autoReconnect).be.equal('foo-bar');
  });

  it('should get "autoReplay" property from protocol instance', () => {
    kuzzle.protocol.autoReplay = 'foo-bar';
    should(kuzzle.autoReplay).be.equal('foo-bar');
  });

  it('should get "jwt" property from private _jwt one', () => {
    kuzzle._jwt = 'foo-bar';
    should(kuzzle.jwt).be.equal('foo-bar');
  });

  it('should get "host" property from protocol instance', () => {
    kuzzle.protocol.host = 'foo-bar';
    should(kuzzle.host).be.equal('foo-bar');
  });

  it('should get "offlineQueue" property from protocol instance', () => {
    kuzzle.protocol.offlineQueue = 'foo-bar';
    should(kuzzle.offlineQueue).be.equal('foo-bar');
  });

  it('should get "offlineQueueLoader" property from protocol instance', () => {
    kuzzle.protocol.offlineQueueLoader = 'foo-bar';
    should(kuzzle.offlineQueueLoader).be.equal('foo-bar');
  });

  it('should get "port" property from protocol instance', () => {
    kuzzle.protocol.port = 'foo-bar';
    should(kuzzle.port).be.equal('foo-bar');
  });

  it('should get "queueFilter" property from protocol instance', () => {
    kuzzle.protocol.queueFilter = 'foo-bar';
    should(kuzzle.queueFilter).be.equal('foo-bar');
  });

  it('should get "queueMaxSize" property from protocol instance', () => {
    kuzzle.protocol.queueMaxSize = 'foo-bar';
    should(kuzzle.queueMaxSize).be.equal('foo-bar');
  });

  it('should get "queueTTL" property from protocol instance', () => {
    kuzzle.protocol.queueTTL = 'foo-bar';
    should(kuzzle.queueTTL).be.equal('foo-bar');
  });

  it('should get "reconnectionDelay" property from protocol instance', () => {
    kuzzle.protocol.reconnectionDelay = 'foo-bar';
    should(kuzzle.reconnectionDelay).be.equal('foo-bar');
  });

  it('should get "replayInterval" property from protocol instance', () => {
    kuzzle.protocol.replayInterval = 'foo-bar';
    should(kuzzle.replayInterval).be.equal('foo-bar');
  });

  it('should get "sslConnection" property from protocol instance', () => {
    kuzzle.protocol.sslConnection = 'foo-bar';
    should(kuzzle.sslConnection).be.equal('foo-bar');
  });
});
