const
  should = require('should'),
  sinon = require('sinon'),
  { Kuzzle } = require('../../src/Kuzzle'),
  { AuthController } = require('../../src/controllers/Auth'),
  { BulkController } = require('../../src/controllers/Bulk'),
  { CollectionController } = require('../../src/controllers/Collection'),
  { DocumentController } = require('../../src/controllers/Document'),
  { IndexController } = require('../../src/controllers/Index'),
  { MemoryStorageController } = require('../../src/controllers/MemoryStorage'),
  { SecurityController } = require('../../src/controllers/Security'),
  { ServerController } = require('../../src/controllers/Server'),
  { RealtimeController } = require('../../src/controllers/Realtime'),
  {
    WebSocket, // eslint-disable-line no-redeclare
    Http
  } = require('../../src/protocols'),
  ProtocolMock = require('../mocks/protocol.mock');

describe('Kuzzle constructor', () => {
  const protocolMock = new ProtocolMock('somewhere');

  it('should throw an error if no protocol wrapper is provided', () => {
    should(function () {
      new Kuzzle();
    }).throw('"protocol" argument missing');
  });

  it('should throw an error if the protocol wrapper does not implement required methods', () => {
    const protocol = {};
    should(function () {
      new Kuzzle(protocol);
    }).throw('Protocol instance must implement a "addListener" method');

    protocol.addListener = sinon.stub();
    should(function () {
      new Kuzzle(protocol);
    }).throw('Protocol instance must implement a "isReady" method');

    protocol.isReady = sinon.stub();
    should(function () {
      new Kuzzle(protocol);
    }).throw('Protocol instance must implement a "query" method');

    protocol.query = sinon.stub();
    should(function () {
      new Kuzzle(protocol);
    }).not.throw();
  });

  it('should get a custom protocol instance', () => {
    const kuzzle = new Kuzzle(protocolMock);
    should(kuzzle.protocol).be.an.instanceOf(ProtocolMock);
    should(kuzzle.protocol).be.equal(protocolMock);
  });

  it('should expose the documented controllers', () => {
    const kuzzle = new Kuzzle(protocolMock);

    should(kuzzle.auth).be.an.instanceof(AuthController);
    should(kuzzle.bulk).be.an.instanceof(BulkController);
    should(kuzzle.collection).be.an.instanceof(CollectionController);
    should(kuzzle.document).be.an.instanceof(DocumentController);
    should(kuzzle.index).be.an.instanceof(IndexController);
    should(kuzzle.ms).be.an.instanceof(MemoryStorageController);
    should(kuzzle.security).be.an.instanceof(SecurityController);
    should(kuzzle.server).be.an.instanceof(ServerController);
    should(kuzzle.realtime).be.an.instanceof(RealtimeController);
  });

  it('should expose the documented properties with their default values', () => {
    const
      version = require('../../package').version,
      kuzzle = new Kuzzle(protocolMock);

    should(kuzzle.autoResubscribe).be.a.Boolean().and.be.true();
    should(kuzzle.eventTimeout).be.a.Number().and.be.equal(200);
    should(kuzzle.protocol).be.an.instanceof(ProtocolMock);
    should(kuzzle.sdkVersion).be.a.String().and.be.equal(version);
    should(kuzzle.sdkName).be.a.String().and.be.equal(`js@${version}`);
    should(kuzzle.volatile).be.an.Object().and.be.empty();
  });

  it('should initialize correctly properties using the "options" argument', function () {
    const
      options = {
        autoResubscribe: false,
        volatile: {foo: ['bar', 'baz', 'qux'], bar: 'foo'},
        eventTimeout: 1000,
        foo: 'bar'
      },
      kuzzle = new Kuzzle(protocolMock, options);

    should(kuzzle.autoResubscribe).be.a.Boolean().and.be.false();
    should(kuzzle.eventTimeout).be.a.Number().and.be.exactly(1000);
    should(kuzzle.volatile).be.an.Object().and.match(options.volatile);
  });

  it('should not override read-only properties with the "options" argument', function () {
    const
      version = require('../../package').version,
      options = {
        auth: 'Auth',
        bulk: 'Bulk',
        collection: 'Collection',
        document: 'Document',
        index: 'Index',
        ms: 'MS',
        security: 'security',
        server: 'server',
        realtime: 'realtime',
        protocol: 'protocol',
        jwt: 'jwt',
        version: 'version'
      },
      kuzzle = new Kuzzle(protocolMock, options);

    should(kuzzle.auth).be.an.instanceof(AuthController);
    should(kuzzle.bulk).be.an.instanceof(BulkController);
    should(kuzzle.collection).be.an.instanceof(CollectionController);
    should(kuzzle.document).be.an.instanceof(DocumentController);
    should(kuzzle.index).be.an.instanceof(IndexController);
    should(kuzzle.ms).be.an.instanceof(MemoryStorageController);
    should(kuzzle.security).be.an.instanceof(SecurityController);
    should(kuzzle.server).be.an.instanceof(ServerController);
    should(kuzzle.realtime).be.an.instanceof(RealtimeController);
    should(kuzzle.protocol).be.an.instanceof(ProtocolMock);
    should(kuzzle.sdkVersion).be.a.String().and.be.equal(version);
    should(kuzzle.jwt).be.null();
  });

  it('should set autoQueue and autoReplay if offlineMode is set to auto', () => {
    const kuzzle = new Kuzzle(protocolMock, {
      autoQueue: false,
      autoReplay : true,
      offlineMode: 'auto'
    });

    should(kuzzle.autoQueue).be.true();
    should(kuzzle.autoReplay).be.true();
  });

  it('should initialize kuzzle with WebSocket', () => {
    should(() => {
      new Kuzzle(
        new WebSocket('localhost')
      );
    }).not.throw();
  });

  it('should initialize kuzzle with Http', () => {
    should(() => {
      new Kuzzle(
        new Http('localhost')
      );
    }).not.throw();
  });

  it('should call protocol.enableCookieSupport', () => {
    /* eslint-disable no-native-reassign */
    /* eslint-disable no-global-assign */
    XMLHttpRequest = () => {}; // Faking being in a browser, otherwise kuzzle will throw that cookie are not supported    
    const kuzzle = new Kuzzle(protocolMock, {
      cookieAuth: true,
    });

    should(kuzzle.cookieAuthentication).be.true();
    should(protocolMock.enableCookieSupport).be.calledOnce();
    /* eslint-disable no-native-reassign */
    /* eslint-disable no-global-assign */
    XMLHttpRequest = undefined; // Reset it to undefined
  });
});
