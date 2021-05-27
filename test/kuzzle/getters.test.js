const
  should = require('should'),
  ProtocolMock = require('../mocks/protocol.mock'),
  generateJwt = require('../mocks/generateJwt.mock'),
  { Kuzzle } = require('../../src/Kuzzle');

describe('Kuzzle getters', () => {
  let
    jwt,
    kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock('somewhere');

    kuzzle = new Kuzzle(protocol);

    jwt = generateJwt();

    kuzzle.auth.authenticationToken = jwt;
  });

  it('should get "autoQueue" property from private _autoQueue one', () => {
    kuzzle._autoQueue = 'foo-bar';
    should(kuzzle.autoQueue).be.equal('foo-bar');
  });

  it('should get "autoReconnect" property from protocol instance', () => {
    kuzzle.protocol.autoReconnect = 'foo-bar';
    should(kuzzle.autoReconnect).be.equal('foo-bar');
  });

  it('should get "autoReplay" property from private _autoReplay one', () => {
    kuzzle._autoReplay = 'foo-bar';
    should(kuzzle.autoReplay).be.equal('foo-bar');
  });

  it('should get "jwt" property from auth authenticationToken', () => {
    should(kuzzle.jwt).be.equal(kuzzle.auth.authenticationToken.encodedJwt);

    kuzzle.jwt = null;
    should(kuzzle.jwt).be.equal(null);
  });

  it('should get "host" property from protocol instance', () => {
    kuzzle.protocol.host = 'foo-bar';
    should(kuzzle.host).be.equal('foo-bar');
  });

  it('should get "offlineQueue" property from private _offlineQueue one', () => {
    kuzzle._offlineQueue = 'foo-bar';
    should(kuzzle.offlineQueue).be.equal('foo-bar');
  });

  it('should get "offlineQueueLoader" property from private _offlineQueueLoader one', () => {
    kuzzle._offlineQueueLoader = 'foo-bar';
    should(kuzzle.offlineQueueLoader).be.equal('foo-bar');
  });

  it('should get "port" property from protocol instance', () => {
    kuzzle.protocol.port = 'foo-bar';
    should(kuzzle.port).be.equal('foo-bar');
  });

  it('should get "queueFilter" property from private _queueFilter one', () => {
    kuzzle._queueFilter = 'foo-bar';
    should(kuzzle.queueFilter).be.equal('foo-bar');
  });

  it('should get "queueMaxSize" property from private _queueMaxSize one', () => {
    kuzzle._queueMaxSize = 'foo-bar';
    should(kuzzle.queueMaxSize).be.equal('foo-bar');
  });

  it('should get "queueTTL" property from private _queueTTL one', () => {
    kuzzle._queueTTL = 'foo-bar';
    should(kuzzle.queueTTL).be.equal('foo-bar');
  });

  it('should get "reconnectionDelay" property from protocol instance', () => {
    kuzzle.protocol.reconnectionDelay = 'foo-bar';
    should(kuzzle.reconnectionDelay).be.equal('foo-bar');
  });

  it('should get "replayInterval" property from private _replayInterval one', () => {
    kuzzle._replayInterval = 'foo-bar';
    should(kuzzle.replayInterval).be.equal('foo-bar');
  });

  it('should get "requestTimeout" property from private _requestTimeout one', () => {
    kuzzle._requestTimeout = 'foo-bar';
    should(kuzzle._requestTimeout).be.equal('foo-bar');
  });

  it('should get "sslConnection" property from protocol instance', () => {
    kuzzle.protocol.sslConnection = 'foo-bar';
    should(kuzzle.sslConnection).be.equal('foo-bar');
  });

  it('should get "tokenExpiredInterval" from private _tokenExpiredInterval', () => {
    kuzzle._tokenExpiredInterval = 'foo-bar';
    should(kuzzle._tokenExpiredInterval).eql('foo-bar');
  });
});
