var
  should = require('should'),
  sinon = require('sinon'),
  bluebird = require('bluebird'),
  proxyquire = require('proxyquire'),
  Kuzzle = require('../../src/Kuzzle'),
  MemoryStorage = require('../../src/MemoryStorage'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Security = require('../../src/security/Security');

describe('Kuzzle constructor', function () {
  var connectStub;

  beforeEach(function () {
    connectStub = sinon.stub(Kuzzle.prototype, 'connect');
  });

  afterEach(function() {
    connectStub.restore();
  });

  it('should throw an error if no URL is provided', function () {
    should(function () {
      new Kuzzle();
    }).throw();
  });

  it('should expose the documented functions', function () {
    var kuzzle = new Kuzzle('somewhere');

    should(kuzzle.addListener).be.a.Function();
    should(kuzzle.collection).be.a.Function();
    should(kuzzle.connect).be.a.Function();
    should(kuzzle.createIndex).be.a.Function();
    should(kuzzle.disconnect).be.a.Function();
    should(kuzzle.flushQueue).be.a.Function();
    should(kuzzle.getAllStatistics).be.a.Function();
    should(kuzzle.getAutoRefresh).be.a.Function();
    should(kuzzle.getJwt).be.a.Function();
    should(kuzzle.getMyCredentials).be.a.Function();
    should(kuzzle.getMyRights).be.a.Function();
    should(kuzzle.getServerInfo).be.a.Function();
    should(kuzzle.getStatistics).be.a.Function();
    should(kuzzle.listCollections).be.a.Function();
    should(kuzzle.listIndexes).be.a.Function();
    should(kuzzle.login).be.a.Function();
    should(kuzzle.logout).be.a.Function();
    should(kuzzle.now).be.a.Function();
    should(kuzzle.playQueue).be.a.Function();
    should(kuzzle.query).be.a.Function();
    should(kuzzle.refreshIndex).be.a.Function();
    should(kuzzle.removeAllListeners).be.a.Function();
    should(kuzzle.removeListener).be.a.Function();
    should(kuzzle.setAutoRefresh).be.a.Function();
    should(kuzzle.setDefaultIndex).be.a.Function();
    should(kuzzle.setJwt).be.a.Function();
    should(kuzzle.startQueuing).be.a.Function();
    should(kuzzle.stopQueuing).be.a.Function();
    should(kuzzle.unsetJwt).be.a.Function();
    should(kuzzle.updateMyCredentials).be.a.Function();
    should(kuzzle.updateSelf).be.a.Function();
    should(kuzzle.validateMyCredentials).be.a.Function();
    should(kuzzle.whoAmI).be.a.Function();
  });

  it('should expose the documented writable properties', function () {
    var 
      kuzzle = new Kuzzle('somewhere'),
      fn = function() {};

    // there is no way to simply test the presence of a getter or a setter
    // we have to manually make sure that the value can be changed
    should(kuzzle).have.propertyWithDescriptor('autoQueue', { enumerable: true});
    should(kuzzle.autoQueue).be.eql(false);
    kuzzle.autoQueue = true;
    should(kuzzle.autoQueue).be.true();
    should(function() {kuzzle.autoQueue = 123;}).throw();

    should(kuzzle).have.propertyWithDescriptor('autoReplay', { enumerable: true});
    should(kuzzle.autoReplay).be.eql(false);
    kuzzle.autoReplay = true;
    should(kuzzle.autoReplay).be.true();
    should(function() {kuzzle.autoReplay = 123;}).throw();

    should(kuzzle).have.propertyWithDescriptor('defaultIndex', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('jwt', { enumerable: true, writable: true, configurable: false });

    should(kuzzle).have.propertyWithDescriptor('offlineQueueLoader', { enumerable: true});
    should(kuzzle.offlineQueueLoader).be.null();
    kuzzle.offlineQueueLoader = fn;
    should(kuzzle.offlineQueueLoader).be.eql(fn);
    // special case: should be able to unset this property by providing a null value
    kuzzle.offlineQueueLoader = null;
    should(kuzzle.offlineQueueLoader).be.null();
    should(function() {kuzzle.offlineQueueLoader = 123;}).throw();

    should(kuzzle).have.propertyWithDescriptor('queueMaxSize', { enumerable: true });
    should(kuzzle.queueMaxSize).be.eql(500);
    kuzzle.queueMaxSize = 123;
    should(kuzzle.queueMaxSize).be.eql(123);
    should(function() {kuzzle.queueMaxSize = 'foobar';}).throw();

    should(kuzzle).have.propertyWithDescriptor('queueTTL', { enumerable: true });
    should(kuzzle.queueTTL).be.eql(120000);
    kuzzle.queueTTL = 123;
    should(kuzzle.queueTTL).be.eql(123);
    should(function() {kuzzle.queueTTL = 'foobar';}).throw();
    
    should(kuzzle).have.propertyWithDescriptor('replayInterval', { enumerable: true });
    should(kuzzle.replayInterval).be.eql(10);
    kuzzle.replayInterval = 123;
    should(kuzzle.replayInterval).be.eql(123);
    should(function() {kuzzle.replayInterval = 'foobar';}).throw();

    should(kuzzle).have.propertyWithDescriptor('volatile', { enumerable: true, writable: true, configurable: false });
  });

  it('should expose the documented read-only properties', function () {
    var kuzzle = new Kuzzle('somewhere');

    // there is no way to simply test the presence of a getter or a setter
    // we have to manually make sure that the value cannot be changed
    should(kuzzle).have.propertyWithDescriptor('autoReconnect', { enumerable: true });
    should(kuzzle.autoReconnect).be.true();
    kuzzle.autoReconnect = false;
    should(kuzzle.autoReconnect).be.true();

    should(kuzzle).have.propertyWithDescriptor('autoResubscribe', { enumerable: true });
    should(kuzzle.autoResubscribe).be.true();
    kuzzle.autoResubscribe = false;
    should(kuzzle.autoResubscribe).be.true();

    should(kuzzle).have.propertyWithDescriptor('host', { enumerable: true });
    should(kuzzle.host).be.eql('somewhere');
    kuzzle.host = 'foobar';
    should(kuzzle.host).be.eql('somewhere');

    should(kuzzle).have.propertyWithDescriptor('port', { enumerable: true });
    should(kuzzle.port).be.eql(7512);
    kuzzle.port = 123;
    should(kuzzle.port).be.eql(7512);

    should(kuzzle).have.propertyWithDescriptor('protocol', { enumerable: true });
    should(kuzzle.protocol).be.eql('websocket');
    kuzzle.protocol = 'foobar';
    should(kuzzle.protocol).be.eql('websocket');

    should(kuzzle).have.propertyWithDescriptor('reconnectionDelay', { enumerable: true });
    should(kuzzle.reconnectionDelay).be.eql(1000);
    kuzzle.reconnectionDelay = 123;
    should(kuzzle.reconnectionDelay).be.eql(1000);


    should(kuzzle).have.propertyWithDescriptor('offlineQueue', { enumerable: true});
    should(kuzzle.offlineQueue).be.an.Array().and.be.empty();
    kuzzle.offlineQueue = ['foo', 'bar'];
    should(kuzzle.offlineQueue).be.an.Array().and.be.empty();
    
    should(kuzzle).have.propertyWithDescriptor('sdkVersion', { enumerable: false, writable: false, configurable: false });
  });

  it('should have right internal properties and methods', function () {
    var kuzzle = new Kuzzle('somewhere');

    should(kuzzle.callbackRequired).be.a.Function();
    should(kuzzle.subscribe).be.a.Function();
    should(kuzzle.unsubscribe).be.a.Function();

    should(kuzzle).have.propertyWithDescriptor('collections', { enumerable: false, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('eventActions', { enumerable: false, writable: false, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('eventTimeout', { enumerable: false, writable: false, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('protectedEvents', { enumerable: false, writable: false, configurable: false });
  });

  it('should have properties with the documented and internal default values', function () {
    var
      sdkVersion = require('../../package.json').version,
      kuzzle = new Kuzzle('somewhere');

    should(kuzzle.autoResubscribe).be.true();
    should(kuzzle.defaultIndex).be.undefined();
    should(kuzzle.jwt).be.undefined();
    should(kuzzle.protocol).be.exactly('websocket');
    should(kuzzle.sdkVersion).be.exactly(sdkVersion);
    should(kuzzle.volatile).be.an.Object().and.be.empty();

    should(kuzzle.collections).be.an.Object().and.be.empty();
    should(kuzzle.eventActions).be.an.Array()
      .and.containEql('connected')
      .and.containEql('discarded')
      .and.containEql('disconnected')
      .and.containEql('loginAttempt')
      .and.containEql('networkError')
      .and.containEql('offlineQueuePush')
      .and.containEql('offlineQueuePop')
      .and.containEql('queryError')
      .and.containEql('reconnected')
      .and.containEql('tokenExpired');
    should(kuzzle.eventTimeout).be.exactly(200);
    should(kuzzle.protectedEvents).be.an.Object();
    should(kuzzle.protectedEvents.connected).be.eql({timeout: 200});
    should(kuzzle.protectedEvents.error).be.eql({timeout: 200});
    should(kuzzle.protectedEvents.disconnected).be.eql({timeout: 200});
    should(kuzzle.protectedEvents.reconnected).be.eql({timeout: 200});
    should(kuzzle.protectedEvents.tokenExpired).be.eql({timeout: 200});
    should(kuzzle.protectedEvents.loginAttempt).be.eql({timeout: 200});
  });

  it('should expose the right singletons', function () {
    var kuzzle = new Kuzzle('somewhere');

    should(kuzzle.security).be.an.instanceOf(Security);
    should(kuzzle.memoryStorage).be.an.instanceOf(MemoryStorage);
  });

  it('should initialize correctly properties using the "options" argument', function () {
    var MockedKuzzle = proxyquire('../../src/Kuzzle', {
      './networkWrapper': function(protocol, host, options) {
        return new NetworkWrapperMock(host, options);
      }
    });
    
    var
      sdkVersion = require('../../package.json').version,
      options = {
        autoResubscribe: false,
        protocol: 'fakeproto',
        volatile: {foo: ['bar', 'baz', 'qux'], bar: 'foo'},
        defaultIndex: 'foobar',
        jwt: 'fakejwt',
        eventTimeout: 1000
      },
      kuzzle = new MockedKuzzle('somewhere', options);

    should(kuzzle.autoResubscribe).be.false();
    should(kuzzle.defaultIndex).be.exactly('foobar');
    should(kuzzle.jwt).be.exactly('fakejwt');
    should(kuzzle.protocol).be.exactly('fakeproto');
    should(kuzzle.sdkVersion).be.exactly(sdkVersion);
    should(kuzzle.volatile).be.an.Object().and.match(options.volatile);

    should(kuzzle.collections).be.an.Object().and.be.empty();
    should(kuzzle.eventActions).be.an.Array()
      .and.containEql('connected')
      .and.containEql('discarded')
      .and.containEql('disconnected')
      .and.containEql('loginAttempt')
      .and.containEql('networkError')
      .and.containEql('offlineQueuePush')
      .and.containEql('offlineQueuePop')
      .and.containEql('queryError')
      .and.containEql('reconnected')
      .and.containEql('tokenExpired');
    should(kuzzle.eventTimeout).be.exactly(1000);
    should(kuzzle.protectedEvents).be.an.Object();
    should(kuzzle.protectedEvents.connected).be.eql({timeout: 1000});
    should(kuzzle.protectedEvents.error).be.eql({timeout: 1000});
    should(kuzzle.protectedEvents.disconnected).be.eql({timeout: 1000});
    should(kuzzle.protectedEvents.reconnected).be.eql({timeout: 1000});
    should(kuzzle.protectedEvents.tokenExpired).be.eql({timeout: 1000});
    should(kuzzle.protectedEvents.loginAttempt).be.eql({timeout: 1000});
  });

  it('should promisify the right functions', function () {
    var kuzzle;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('somewhere');

    should(kuzzle.addListenerPromise).be.undefined();
    should(kuzzle.collectionPromise).be.undefined();
    should(kuzzle.connectPromise).be.a.Function();
    should(kuzzle.createIndexPromise).be.a.Function();
    should(kuzzle.disconnectPromise).be.undefined();
    should(kuzzle.flushQueuePromise).be.undefined();
    should(kuzzle.getAllStatisticsPromise).be.a.Function();
    should(kuzzle.getAutoRefreshPromise).be.a.Function();
    should(kuzzle.getJwtPromise).be.undefined();
    should(kuzzle.getMyCredentialsPromise).be.a.Function();
    should(kuzzle.getMyRightsPromise).be.a.Function();
    should(kuzzle.getServerInfoPromise).be.a.Function();
    should(kuzzle.getStatisticsPromise).be.a.Function();
    should(kuzzle.listCollectionsPromise).be.a.Function();
    should(kuzzle.listIndexesPromise).be.a.Function();
    should(kuzzle.loginPromise).be.a.Function();
    should(kuzzle.logoutPromise).be.a.Function();
    should(kuzzle.nowPromise).be.a.Function();
    should(kuzzle.playQueuePromise).be.undefined();
    should(kuzzle.queryPromise).be.a.Function();
    should(kuzzle.refreshIndexPromise).be.a.Function();
    should(kuzzle.removeAllListenersPromise).be.undefined();
    should(kuzzle.removeListenerPromise).be.undefined();
    should(kuzzle.setAutoRefreshPromise).be.a.Function();
    should(kuzzle.setDefaultIndexPromise).be.undefined();
    should(kuzzle.setJwtPromise).be.undefined();
    should(kuzzle.startQueuingPromise).be.undefined();
    should(kuzzle.stopQueuingPromise).be.undefined();
    should(kuzzle.unsetJwtPromise).be.undefined();
    should(kuzzle.updateMyCredentialsPromise).be.a.Function();
    should(kuzzle.updateSelfPromise).be.a.Function();
    should(kuzzle.validateMyCredentialsPromise).be.a.Function();
    should(kuzzle.whoAmIPromise).be.a.Function();
  });
});
