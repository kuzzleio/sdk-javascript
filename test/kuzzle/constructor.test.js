const
  should = require('should'),
  sinon = require('sinon'),
  proxyquire = require('proxyquire'),
  AuthController = require('../../src/controllers/auth'),
  BulkController = require('../../src/controllers/bulk'),
  CollectionController = require('../../src/controllers/collection'),
  DocumentController = require('../../src/controllers/document'),
  IndexController = require('../../src/controllers/index'),
  MemoryStorageController = require('../../src/controllers/memoryStorage'),
  SecurityController = require('../../src/controllers/security'),
  ServerController = require('../../src/controllers/server'),
  RealTimeController = require('../../src/controllers/realtime'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock');

const Kuzzle = proxyquire('../../src/Kuzzle', {
  './networkWrapper': function(protocol, options) {
    const network = new NetworkWrapperMock(options);
    network.protocol = protocol;
    return network;
  }
});


describe('Kuzzle constructor', () => {
  const networkMock = new NetworkWrapperMock({host: 'somewhere'});

  it('should throw an error if no network wrapper is provided', () => {
    should(function () {
      new Kuzzle();
    }).throw('"network" argument missing');
  });

  it('should throw an error if the network wrapper does not implement required methods', () => {
    const network = {};
    should(function () {
      new Kuzzle(network);
    }).throw('Network instance must implement a "addListener" method');

    network.addListener = sinon.stub();
    should(function () {
      new Kuzzle(network);
    }).throw('Network instance must implement a "isReady" method');

    network.isReady = sinon.stub();
    should(function () {
      new Kuzzle(network);
    }).throw('Network instance must implement a "query" method');

    network.query = sinon.stub();
    should(function () {
      new Kuzzle(network);
    }).not.throw();
  });

  it('should intialize embed network instance with the "options" argument', () => {
    const
      options = {foo: ['bar', 'baz', 'qux'], bar: 'foo' },
      kuzWS = new Kuzzle('websocket', options),
      kuzSocketIO = new Kuzzle('socketio', options),
      kuzHTTP = new Kuzzle('http', options);

    should(kuzWS.network).be.an.instanceOf(NetworkWrapperMock);
    should(kuzWS.network.options).match(options);
    should(kuzWS.network.protocol).be.eql('websocket');

    should(kuzSocketIO.network).be.an.instanceOf(NetworkWrapperMock);
    should(kuzSocketIO.network.options).match(options);
    should(kuzSocketIO.network.protocol).be.eql('socketio');

    should(kuzHTTP.network).be.an.instanceOf(NetworkWrapperMock);
    should(kuzHTTP.network.options).match(options);
    should(kuzHTTP.network.protocol).be.eql('http');
  });

  it('should get a custom network instance', () => {
    const kuzzle = new Kuzzle(networkMock);
    should(kuzzle.network).be.an.instanceOf(NetworkWrapperMock);
    should(kuzzle.network).be.equal(networkMock);
  });

  it('should expose the documented controllers', () => {
    const kuzzle = new Kuzzle(networkMock);

    should(kuzzle.auth).be.an.instanceof(AuthController);
    should(kuzzle.bulk).be.an.instanceof(BulkController);
    should(kuzzle.collection).be.an.instanceof(CollectionController);
    should(kuzzle.document).be.an.instanceof(DocumentController);
    should(kuzzle.index).be.an.instanceof(IndexController);
    should(kuzzle.ms).be.an.instanceof(MemoryStorageController);
    should(kuzzle.security).be.an.instanceof(SecurityController);
    should(kuzzle.server).be.an.instanceof(ServerController);
    should(kuzzle.realtime).be.an.instanceof(RealTimeController);
  });

  it('should expose the documented properties with their default values', () => {
    const
      version = require('../../package').version,
      kuzzle = new Kuzzle(networkMock);

    should(kuzzle.autoResubscribe).be.a.Boolean().and.be.true();
    should(kuzzle.eventTimeout).be.a.Number().and.be.equal(200);
    should(kuzzle.network).be.an.instanceof(NetworkWrapperMock);
    should(kuzzle.sdkVersion).be.a.String().and.be.equal(version);
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
      kuzzle = new Kuzzle(networkMock, options);

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
        network: 'network',
        jwt: 'jwt',
        version: 'version'
      },
      kuzzle = new Kuzzle(networkMock, options);

    should(kuzzle.auth).be.an.instanceof(AuthController);
    should(kuzzle.bulk).be.an.instanceof(BulkController);
    should(kuzzle.collection).be.an.instanceof(CollectionController);
    should(kuzzle.document).be.an.instanceof(DocumentController);
    should(kuzzle.index).be.an.instanceof(IndexController);
    should(kuzzle.ms).be.an.instanceof(MemoryStorageController);
    should(kuzzle.security).be.an.instanceof(SecurityController);
    should(kuzzle.server).be.an.instanceof(ServerController);
    should(kuzzle.realtime).be.an.instanceof(RealTimeController);
    should(kuzzle.network).be.an.instanceof(NetworkWrapperMock);
    should(kuzzle.sdkVersion).be.a.String().and.be.equal(version);
    should(kuzzle.jwt).be.undefined();
  });

  it('should set autoQueue and autoReplay if offlineMode is set to auto', () => {
    const kuzzle = new Kuzzle(networkMock, {
      autoQueue: false,
      autoReplay : true,
      offlineMode: 'auto'
    });

    should(kuzzle.autoQueue).be.true();
    should(kuzzle.autoReplay).be.true();
  });
});
