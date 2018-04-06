const
  should = require('should'),
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
  './networkWrapper': function(protocol, host, options) {
    return new NetworkWrapperMock(host, options);
  }
});

describe('Kuzzle constructor', () => {
  it('should throw an error if no URL is provided', () => {
    should(function () {
      new Kuzzle();
    }).throw();
  });

  it('should expose the documented controllers', () => {
    const kuzzle = new Kuzzle('somewhere');

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

  it('should expose the documented properties wwith their default values', () => {
    const
      version = require('../../package').version,
      kuzzle = new Kuzzle('somewhere');

    should(kuzzle.autoResubscribe).be.a.Boolean().and.be.true();
    should(kuzzle.eventTimeout).be.a.Number().and.be.equal(200);
    should(kuzzle.network).be.an.instanceof(NetworkWrapperMock);
    should(kuzzle.protocol).be.a.String().and.be.equal('websocket');
    should(kuzzle.version).be.a.String().and.be.equal(version);
    should(kuzzle.volatile).be.an.Object().and.be.empty();
  });

  it('should initialize correctly properties using the "options" argument', function () {
    const
      options = {
        autoResubscribe: false,
        protocol: 'fakeproto',
        volatile: {foo: ['bar', 'baz', 'qux'], bar: 'foo'},
        eventTimeout: 1000,
        foo: 'bar'
      },
      kuzzle = new Kuzzle('somewhere', options);

    should(kuzzle.autoResubscribe).be.a.Boolean().and.be.false();
    should(kuzzle.eventTimeout).be.a.Number().and.be.exactly(1000);
    should(kuzzle.protocol).be.exactly('fakeproto');
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
      kuzzle = new Kuzzle('somewhere', options);

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
    should(kuzzle.version).be.a.String().and.be.equal(version);
    should(kuzzle.jwt).be.undefined();
  });

  it('should intialize network instance with the "options" argument', () => {
    const
      options = {foo: ['bar', 'baz', 'qux'], bar: 'foo' },
      kuzzle = new Kuzzle('somewhere', options);

    should(kuzzle.network.options).match(options);
  });
});
