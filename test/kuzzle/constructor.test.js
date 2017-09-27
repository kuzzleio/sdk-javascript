var
  should = require('should'),
  sinon = require('sinon'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../src/Kuzzle'),
  Security = require('../../src/security/Security');

describe('Kuzzle constructor', function () {
  var connectStub;

  beforeEach(function () {
    connectStub = sinon.stub(Kuzzle.prototype, 'connect');
  });

  afterEach(function() {
    connectStub.restore();
  });

  it('should return a new instance even if not called with "new"', function () {
    var kuzzle = Kuzzle('somewhere');

    kuzzle.should.be.instanceof(Kuzzle);
  });

  it('should throw an error if no URL is provided', function () {
    should(function () {
      new Kuzzle();
    }).throw();
  });

  it('should expose the documented functions', function () {
    var kuzzle = new Kuzzle('somewhere');

    should(kuzzle.addListener).be.a.Function();
    should(kuzzle.checkToken).be.a.Function();
    should(kuzzle.collection).be.a.Function();
    should(kuzzle.connect).be.a.Function();
    should(kuzzle.disconnect).be.a.Function();
    should(kuzzle.flushQueue).be.a.Function();
    should(kuzzle.getAllStatistics).be.a.Function();
    should(kuzzle.getAutoRefresh).be.a.Function();
    should(kuzzle.getJwtToken).be.a.Function();
    should(kuzzle.getMyRights).be.a.Function();
    should(kuzzle.getServerInfo).be.a.Function();
    should(kuzzle.getStatistics).be.a.Function();
    should(kuzzle.listCollections).be.a.Function();
    should(kuzzle.listIndexes).be.a.Function();
    should(kuzzle.login).be.a.Function();
    should(kuzzle.logout).be.a.Function();
    should(kuzzle.now).be.a.Function();
    should(kuzzle.query).be.a.Function();
    should(kuzzle.refreshIndex).be.a.Function();
    should(kuzzle.removeAllListeners).be.a.Function();
    should(kuzzle.removeListener).be.a.Function();
    should(kuzzle.replayQueue).be.a.Function();
    should(kuzzle.setAutoRefresh).be.a.Function();
    should(kuzzle.setDefaultIndex).be.a.Function();
    should(kuzzle.setHeaders).be.a.Function();
    should(kuzzle.startQueuing).be.a.Function();
    should(kuzzle.stopQueuing).be.a.Function();
    should(kuzzle.setJwtToken).be.a.Function();
    should(kuzzle.updateSelf).be.a.Function();
    should(kuzzle.unsetJwtToken).be.a.Function();
    should(kuzzle.whoAmI).be.a.Function();
  });

  it('should expose the documented properties', function () {
    var kuzzle = new Kuzzle('somewhere');

    should(kuzzle).have.propertyWithDescriptor('autoQueue', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('autoReconnect', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('autoReplay', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('autoResubscribe', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('defaultIndex', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('host', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('jwtToken', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('volatile', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('offlineQueue', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('offlineQueueLoader', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('port', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('queueFilter', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('queueMaxSize', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('queueTTL', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('replayInterval', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('reconnectionDelay', { enumerable: true, writable: true, configurable: false });
    should(kuzzle).have.propertyWithDescriptor('sslConnection', { enumerable: true, writable: true, configurable: false });
  });

  it('should have properties with the documented default values', function () {
    var kuzzle = new Kuzzle('somewhere');

    should(kuzzle.autoQueue).be.false();
    should(kuzzle.autoReconnect).be.true();
    should(kuzzle.autoReplay).be.false();
    should(kuzzle.autoResubscribe).be.true();
    should(kuzzle.defaultIndex).be.undefined();
    should(kuzzle.headers).be.an.Object().and.be.empty();
    should(kuzzle.host).be.exactly('somewhere');
    should(kuzzle.jwtToken).be.undefined();
    should(kuzzle.volatile).be.an.Object().and.be.empty();
    should(kuzzle.offlineQueue).be.empty();
    should(kuzzle.offlineQueueLoader).be.undefined();
    should(kuzzle.port).be.exactly(7512);
    should(kuzzle.queueFilter).be.null();
    should(kuzzle.queueMaxSize).be.exactly(500);
    should(kuzzle.queueTTL).be.exactly(120000);
    should(kuzzle.replayInterval).be.exactly(10);
    should(kuzzle.reconnectionDelay).be.exactly(1000);
    should(kuzzle.sslConnection).be.false();
  });

  it('should have right internal properties', function () {
    var kuzzle = new Kuzzle('somewhere');
    should(kuzzle.security).be.an.instanceOf(Security);
  });

  it('should initialize correctly properties using the "options" argument', function () {
    var options = {
        autoQueue: true,
        autoReconnect: false,
        autoReplay: true,
        autoResubscribe: false,
        queueTTL: 123,
        queueMaxSize: 42,
        headers: {foo: 'bar'},
        volatile: {foo: ['bar', 'baz', 'qux'], bar: 'foo'},
        replayInterval: 99999,
        reconnectionDelay: 666,
        defaultIndex: 'foobar',
        port: 1234,
        sslConnection: true,
        offlineQueueLoader: sinon.stub(),
        queueFilter: sinon.stub()
      },
      kuzzle = new Kuzzle('somewhere', options);

    should(kuzzle.autoQueue).be.exactly(options.autoQueue);
    should(kuzzle.autoReconnect).be.exactly(options.autoReconnect);
    should(kuzzle.autoReplay).be.exactly(options.autoReplay);
    should(kuzzle.autoResubscribe).be.exactly(options.autoResubscribe);
    should(kuzzle.defaultIndex).be.exactly('foobar');
    should(kuzzle.headers).be.an.Object().and.match(options.headers);
    should(kuzzle.host).be.exactly('somewhere');
    should(kuzzle.volatile).be.an.Object().and.match(options.volatile);
    should(kuzzle.offlineQueueLoader).be.a.Function();
    should(kuzzle.port).be.exactly(options.port);
    should(kuzzle.queueFilter).be.a.Function();
    should(kuzzle.queueMaxSize).be.exactly(options.queueMaxSize);
    should(kuzzle.queueTTL).be.exactly(options.queueTTL);
    should(kuzzle.replayInterval).be.exactly(options.replayInterval);
    should(kuzzle.reconnectionDelay).be.exactly(options.reconnectionDelay);
    should(kuzzle.sslConnection).be.exactly(options.sslConnection);
  });

  it('should handle the offlineMode option properly', function () {
    var kuzzle = new Kuzzle('somewhere', {offlineMode: 'auto'});

    should(kuzzle.autoQueue).be.true();
    should(kuzzle.autoReconnect).be.true();
    should(kuzzle.autoReplay).be.true();
    should(kuzzle.autoResubscribe).be.true();
  });

  it('should handle the connect option properly', function () {
    var kuzzle = new Kuzzle('somewhere', {connect: 'manual'});

    should(connectStub.called).be.false();
    should(kuzzle.state).be.exactly('ready');

    kuzzle = new Kuzzle('somewhere', {connect: 'auto'});
    should(connectStub.called).be.true();
  });

  it('should promisify the right functions', function () {
    var kuzzle;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('somewhere');

    should(kuzzle.addListenerPromise).be.undefined();
    should(kuzzle.checkTokenPromise).be.a.Function();
    should(kuzzle.collectionPromise).be.undefined();
    should(kuzzle.connectPromise).be.undefined();
    should(kuzzle.disconnectPromise).be.undefined();
    should(kuzzle.flushQueuePromise).be.undefined();
    should(kuzzle.getAllStatisticsPromise).be.a.Function();
    should(kuzzle.getAutoRefreshPromise).be.a.Function();
    should(kuzzle.getJwtTokenPromise).be.undefined();
    should(kuzzle.getMyRightsPromise).be.a.Function();
    should(kuzzle.getServerInfoPromise).be.a.Function();
    should(kuzzle.getStatisticsPromise).be.a.Function();
    should(kuzzle.listCollectionsPromise).be.a.Function();
    should(kuzzle.listIndexesPromise).be.a.Function();
    should(kuzzle.loginPromise).be.a.Function();
    should(kuzzle.logoutPromise).be.a.Function();
    should(kuzzle.nowPromise).be.a.Function();
    should(kuzzle.queryPromise).be.a.Function();
    should(kuzzle.refreshIndexPromise).be.a.Function();
    should(kuzzle.removeAllListenersPromise).be.undefined();
    should(kuzzle.removeListenerPromise).be.undefined();
    should(kuzzle.replayQueuePromise).be.undefined();
    should(kuzzle.setAutoRefreshPromise).be.a.Function();
    should(kuzzle.setDefaultIndexPromise).be.undefined();
    should(kuzzle.setHeadersPromise).be.undefined();
    should(kuzzle.startQueuingPromise).be.undefined();
    should(kuzzle.stopQueuingPromise).be.undefined();
    should(kuzzle.setJwtTokenPromise).be.undefined();
    should(kuzzle.updateSelfPromise).be.a.Function();
    should(kuzzle.unsetJwtTokenPromise).be.undefined();
    should(kuzzle.whoAmIPromise).be.a.Function();
  });

});
