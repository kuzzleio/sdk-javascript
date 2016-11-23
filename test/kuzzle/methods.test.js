var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  sandbox = sinon.sandbox.create(),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataCollection = require('../../src/kuzzleDataCollection'),
  KuzzleSecurity = require('../../src/security/kuzzleSecurity'),
  KuzzleUser = require('../../src/security/kuzzleUser');

describe('Kuzzle methods', function () {
  var
    expectedQuery,
    passedOptions,
    error,
    result,
    queryStub = function (args, query, options, cb) {
      emitted = true;
      should(args.collection).be.undefined();
      should(args.index).be.eql(expectedQuery.index);
      should(args.controller).be.exactly(expectedQuery.controller);
      should(args.action).be.exactly(expectedQuery.action);
      if (passedOptions) {
        should(options).match(passedOptions);
      }

      if (expectedQuery.body) {
        should(query.body).match(expectedQuery.body);
      } else {
        should(Object.keys(query).length).be.exactly(0);
      }

      if (cb) {
        if (error) {
          return cb(error);
        }

        cb(error, result);
      }
    },
    emitted,
    kuzzle;

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getAllStatistics', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {hits: []}};
      expectedQuery = {
        controller: 'admin',
        action: 'getAllStats'
      };
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getAllStatistics(); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.getAllStatistics({some: 'options'}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should call the query function with the right arguments', function () {
      kuzzle.getAllStatistics(function () {});
      should(emitted).be.true();

      emitted = false;
      passedOptions = {queuable: true, metadata: {foo: 'bar'}};
      kuzzle.getAllStatistics(passedOptions, function () {});
    });

    it('should execute the callback with an error if an error occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.getAllStatistics(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#getStatistics', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {hits: []}};
      expectedQuery = {
        controller: 'admin',
        action: 'getLastStats'
      };
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getStatistics(); }).throw(Error);
      should(function () { kuzzle.getStatistics(123456); }).throw(Error);
      should(function () { kuzzle.getStatistics({}); }).throw(Error);
      should(function () { kuzzle.getStatistics(123456, {}); }).throw(Error);
    });

    it('should return the last statistics frame if no timestamp is provided', function () {
      kuzzle.getStatistics(function () {});
      should(emitted).be.true();
    });

    it('should return statistics frames starting from the given timestamp', function () {
      expectedQuery = {
        controller: 'admin',
        action: 'getStats',
        body: { startTime: 123 }
      };

      result = {
        result: {
          hits: [
            {123: {}},
            {456: {}},
            {789: {}}
          ]
        }
      };

      kuzzle.getStatistics(123, function () {});
      should(emitted).be.true();
    });

    it('should execute the provided callback with an error argument if one occurs', function (done) {
      error = 'foobar';
      kuzzle.getStatistics(function (err, res) {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should handle arguments properly', function () {
      /*
      already tested by previous tests:
       getStatistics(callback)
       getStatistics(timestamp, callback)
       */

      // testing: getStatistics(options, callback)
      passedOptions = { foo: 'bar' };
      kuzzle.getStatistics(passedOptions, function () {});
      should(emitted).be.true();

      // testing: getStatistics(timestamp, options callback);
      emitted = false;
      expectedQuery = {
        controller: 'admin',
        action: 'getStats',
        body: { startTime: 123 }
      };
      kuzzle.getStatistics(123, passedOptions, function () {});
      should(emitted).be.true();
    });
  });

  describe('#dataCollectionFactory', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if arguments are not strings', () => {
      kuzzle.defaultIndex = 'foobar';
      should(function () { kuzzle.dataCollectionFactory(undefined); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory(undefined, 'foo'); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory(null); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory(null, 'foo'); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory(123); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory(123, 'foo'); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory('foo', 123); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory({foo: 'bar'}); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory({foo: 'bar'}, 'foo'); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory('foo', {foo: 'bar'}); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory(['bar']); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory('foo', ['bar']); }).throw(/string expected/);
      should(function () { kuzzle.dataCollectionFactory(['bar'], 'foo'); }).throw(/string expected/);
    });

    it('should throw an error if the kuzzle instance has been invalidated', function () {
      kuzzle.disconnect();
      should(function () { kuzzle.dataCollectionFactory('foo'); }).throw(Error);
    });

    it('should create and store the data collection instance if needed', function () {
      var collection = kuzzle.dataCollectionFactory('foo', 'bar');

      should(kuzzle.collections.bar.foo).not.be.undefined().and.be.instanceof(KuzzleDataCollection);
      should(collection).be.instanceof(KuzzleDataCollection);
    });

    it('should simply pull the collection from the collection history if reinvoked', function () {
      kuzzle.collections.foo = { bar: 'qux'};
      should(kuzzle.dataCollectionFactory('bar', 'foo')).be.a.String().and.be.exactly('qux');
    });

    it('should use the default index if no index is provided', function () {
      var
        collection,
        defaultIndex = 'bar';

      kuzzle.setDefaultIndex(defaultIndex);
      collection = kuzzle.dataCollectionFactory('foo');
      should(collection).be.instanceof(KuzzleDataCollection);
      should(collection.index).be.eql(defaultIndex);
    });

    it('should throw an error if no index is provided and no default index has been set', () => {
      should(function () { kuzzle.dataCollectionFactory('foo'); }).throw(/no index specified/);
    });
  });

  describe('#getServerInfo', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {serverInfo: {
        kuzzle:
        { version: '0.9.2',
          api: { version: '1.0', routes: {} },
          nodeVersion: 'v4.2.1',
          memoryUsed: 100020224,
          uptime: '161089.628s',
          plugins:
          { 'kuzzle-plugin-logger': {},
            'kuzzle-plugin-socketio': {},
            'kuzzle-plugin-auth-passport-local': {} },
          system: { memory: {}, cpus: {} } },
        services: {
          writeEngine: {
            type: 'elasticsearch',
            api: '1.7',
            version: '1.5.2',
            lucene: '4.10.4',
            status: 'red',
            nodes: {},
            spaceUsed: '14.5kb'
          }
        }
      }}};
      expectedQuery = {
        controller: 'read',
        action: 'serverInfo'
      };
    });

    it('should behave correctly when invoked', function () {
      kuzzle.getServerInfo(function (err, res) {
        should(err).be.null();
        should(res).be.eql(result.result.serverInfo);
      });
    });

    it('should throw an error if no callback is provided', function () {
      should(function () {kuzzle.getServerInfo();}).throw(Error);
      should(emitted).be.false();

      should(function () {kuzzle.getServerInfo({some: 'options'});}).throw(Error);
      should(emitted).be.false();
    });

    it('should execute the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.getServerInfo('foo', function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#listCollections', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {collections: {stored: [], realtime: []}}};
      expectedQuery = {
        index: 'foo',
        controller: 'read',
        action: 'listCollections',
        body: {type: 'all'}
      };
    });

    it('should throw an error if no callback has been provided', function () {
      should(function () { kuzzle.listCollections('foo'); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.listCollections('foo', {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should throw an error if no index has been provided', function () {
      should(function () {kuzzle.listCollections(function () {});}).throw(Error);
      should(emitted).be.false();
      should(function () {kuzzle.listCollections({}, function () {});}).throw(Error);
      should(emitted).be.false();
    });

    it('should call query with the right arguments', function (done) {
      this.timeout(50);
      result = { result: {collections: {stored: ['foo', 'bar', 'baz'], realtime: ['qux'] } } };

      kuzzle.listCollections('foo', function (err, res) {
        should(err).be.null();
        should(res).be.an.Object().and.match(result.result.collections);
        done();
      });
    });

    it('should execute the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.listCollections('foo', function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should handle type option correctly', function (done) {
      expectedQuery.body.type = 'foobar';
      kuzzle.listCollections('foo', {type: 'foobar'}, () => done());
    });

    it('should handle from option correctly', function (done) {
      expectedQuery.body.from = 'foobar';
      kuzzle.listCollections('foo', {from: 'foobar'}, () => done());
    });

    it('should handle size option correctly', function (done) {
      expectedQuery.body.size = 'foobar';
      kuzzle.listCollections('foo', {size: 'foobar'}, () => done());
    });

    it('should use the default index if none is provided', function () {
      kuzzle.setDefaultIndex('foo');
      kuzzle.listCollections(function () {});
      should(emitted).be.true();

      emitted = false;
      kuzzle.listCollections({some: 'options'}, function () {});
      should(emitted).be.true();
    });
  });

  describe('#listIndexes', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {indexes: ['foo', 'bar']}};
      expectedQuery = {
        controller: 'read',
        action: 'listIndexes'
      };
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.listIndexes(); }).throw(Error);
      should(emitted).be.false();

      should(function () {kuzzle.listIndexes({some: 'options'});}).throw(Error);
      should(emitted).be.false();
    });

    it('should execute the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.listIndexes(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });


  });

  describe('#disconnect', function () {
    it('should clean up and invalidate the instance if called', function () {
      kuzzle = new Kuzzle('foo');

      kuzzle.network.close = sinon.stub(kuzzle.network, 'close');
      kuzzle.collections = { foo: {}, bar: {}, baz: {} };
      kuzzle.disconnect();

      should(kuzzle.network).be.null();
      should(kuzzle.collections).be.empty();
      should(function () { kuzzle.isValid(); }).throw(Error);
    });
  });

  describe('#now', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {now: Date.now()}};
      expectedQuery = {
        controller: 'read',
        action: 'now'
      };
    });

    it('should throw an error if called without a callback', function () {
      should(function () { kuzzle.now(); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.now({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should call query with the right arguments', function (done) {
      this.timeout(50);

      kuzzle.now(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result.now);
        done();
      });
    });

    it('should execute the callback with an error argument if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.now(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#setDefaultIndex', function () {
    before(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if the provided index is not a string', function () {
      should((function () {kuzzle.setDefaultIndex();})).throw();
      should((function () {kuzzle.setDefaultIndex({});})).throw();
      should((function () {kuzzle.setDefaultIndex([]);})).throw();
      should((function () {kuzzle.setDefaultIndex(123);})).throw();
      should((function () {kuzzle.setDefaultIndex(null);})).throw();
      should((function () {kuzzle.setDefaultIndex(undefined);})).throw();
    });

    it('should throw an error if the provided index is an empty string', function () {
      should((function () {kuzzle.setDefaultIndex('');})).throw();
    });

    it('should set the default index in all other cases', function () {
      should(kuzzle.setDefaultIndex('foo')).be.eql(kuzzle);
      should(kuzzle.defaultIndex).be.eql('foo');
    });
  });

  describe('#setHeaders', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if an invalid content object is provided', function () {
      should(function () { kuzzle.setHeaders(); }).throw(Error);
      should(function () { kuzzle.setHeaders(123); }).throw(Error);
      should(function () { kuzzle.setHeaders('foo'); }).throw(Error);
      should(function () { kuzzle.setHeaders(['mama', 'mia']); }).throw(Error);
    });

    it('should set headers properly', function () {
      should(kuzzle.setHeaders({foo: 'bar'})).be.exactly(kuzzle);
      kuzzle.setHeaders({bar: 'baz', baz: ['bar, baz, qux', 'foo']});
      kuzzle.setHeaders({foo: { bar: 'baz'}});

      should(kuzzle.headers).match({bar: 'baz', baz: ['bar, baz, qux', 'foo'], foo: { bar: 'baz'}});
    });

    it('should replace existing headers if asked to', function () {
      kuzzle.setHeaders({foo: 'bar'});
      kuzzle.setHeaders({}, true);

      should(kuzzle.headers).be.empty();
    });
  });

  describe('#checkToken', function () {
    it('should send the checkToken after call', function () {
      var
        stubResults = { foo: 'bar' },
        token = 'fakeToken-eoijaodmowifnw8h';

      this.timeout(200);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.query = function (args, query, opts, cb) {
        should(args.action).be.eql('checkToken');
        should(args.controller).be.eql('auth');
        should(query.body.token).be.eql(token);
        cb(null, {result: stubResults });
      };

      kuzzle.state = 'connected';

      kuzzle.checkToken(token, function (err, res) {
        should(err).be.null();
        should(res).be.eql(stubResults);
      });
    });

    it('should resolve to an error if Kuzzle respond with one', function () {
      var
        stubError = { foo: 'bar' },
        token = 'fakeToken-eoijaodmowifnw8h';

      this.timeout(200);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.query = function (args, query, opts, cb) {
        should(args.action).be.eql('checkToken');
        should(args.controller).be.eql('auth');
        should(query.body.token).be.eql(token);
        cb({error: stubError });
      };

      kuzzle.state = 'connected';

      kuzzle.checkToken(token, function (err, res) {
        should(err.error).be.eql(stubError);
        should(res).be.undefined();
      });
    });

    it('should throw an error when it is called with no callback', function (done) {
      var
        token = 'fakeToken-eoijaodmowifnw8h';

      this.timeout(200);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.queuing = true;

      try {
        kuzzle.checkToken(token, null);
      } catch (e) {
        should(e).be.an.instanceOf(Error);
      } finally {
        done();
      }
    });
  });

  describe('#whoAmI', function () {
    it('should send the getCurrentUser after call', function () {
      this.timeout(200);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.queuing = true;

      kuzzle.whoAmI(function () {});

      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].query.action).be.exactly('getCurrentUser');
      should(kuzzle.offlineQueue[0].query.controller).be.exactly('auth');
    });

    it('should send correct query and return a KuzzleUser', function (done) {
      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });
      kuzzle.query = queryStub;

      error = false;
      result = {result: {_id: 'user', _source: {firstName: 'Ada'}}};
      expectedQuery = {
        controller: 'auth',
        action: 'getCurrentUser'
      };

      kuzzle.whoAmI(function (err, res) {
        should(res).instanceof(KuzzleUser);
        done();
      });
    });

    it('should execute the callback with an error if an error occurs', function (done) {
      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });
      kuzzle.query = queryStub;

      this.timeout(50);
      error = 'foobar';

      kuzzle.whoAmI(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#updateSelf', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _index: '%kuzzle', _type: 'users'} };
      expectedQuery = {
        action: 'updateSelf',
        controller: 'auth'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};

      should(kuzzle.updateSelf({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result);
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = {'foo': 'bar'};

      kuzzle.updateSelf({'foo': 'bar'});
      done();
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      error = 'foobar';
      this.timeout(50);

      kuzzle.updateSelf({'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#security', function () {
    it('should be an instance of KuzzleSecurity', function () {
      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      should(kuzzle.security).be.an.instanceOf(KuzzleSecurity);
    });
  });

  describe('#getJwtToken', function () {
    it('should return the current jwt token', function () {
      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.jwtToken = 'testToken';

      should(kuzzle.getJwtToken()).be.exactly('testToken');
    });
  });

  describe('#unsetJwtToken', function () {
    var
      subscriptionsRemoved,
      revert;

    it('should unset the token and call removeAllSubscriptions', function (done) {
      revert = Kuzzle.__set__('removeAllSubscriptions', function () { subscriptionsRemoved = true; });

      kuzzle = new Kuzzle('nowhere', {connect: 'manual'});
      subscriptionsRemoved = false;

      kuzzle.unsetJwtToken();

      process.nextTick(() => {
        should(kuzzle.getJwtToken()).be.eql(undefined);
        should(subscriptionsRemoved).be.true();
        revert();
        done();
      });
    });

    it('should unsubscribe all rooms when un-setting token', function (done) {
      var
        unsubscribeCalled,
        stubKuzzleRoom;

      stubKuzzleRoom = {
        unsubscribe: function () { unsubscribeCalled = true; }
      };

      kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

      kuzzle.subscriptions.foo = { bar: stubKuzzleRoom };

      kuzzle.unsetJwtToken();

      process.nextTick(() => {
        should(unsubscribeCalled).be.true();
        done();
      });
    });
  });

  describe('#setJwtToken', function () {
    var
      eventEmitted,
      loginStatus,
      subscriptionsRenewed,
      revert;

    before(function () {
      revert = Kuzzle.__set__('renewAllSubscriptions', function () { subscriptionsRenewed = true; });
    });

    beforeEach(function () {
      kuzzle = new Kuzzle('nowhere', {connect: 'manual'});
      kuzzle.addListener('loginAttempt', status => {
        eventEmitted = true;
        loginStatus = status;
      });
      eventEmitted = false;
      subscriptionsRenewed = false;
    });

    after(function () {
      revert();
    });

    it('should set the token when provided with a string argument', function (done) {
      kuzzle.setJwtToken('foobar');

      process.nextTick(() => {
        should(kuzzle.getJwtToken()).be.eql('foobar');
        should(subscriptionsRenewed).be.true();
        should(eventEmitted).be.true();
        should(loginStatus.success).be.true();
        done();
      });
    });

    it('should set the token when provided with a kuzzle response argument', function (done) {
      kuzzle.setJwtToken({result:{jwt: 'foobar'}});

      process.nextTick(() => {
        should(kuzzle.getJwtToken()).be.eql('foobar');
        should(subscriptionsRenewed).be.true();
        should(eventEmitted).be.true();
        should(loginStatus.success).be.true();
        done();
      });
    });

    it('should send an "attempt failed" event if provided with an invalid argument type', function (done) {
      kuzzle.setJwtToken();

      process.nextTick(() => {
        should(kuzzle.getJwtToken()).be.undefined();
        should(subscriptionsRenewed).be.false();
        should(eventEmitted).be.true();
        should(loginStatus.success).be.false();
        should(loginStatus.error).not.be.undefined();
        done();
      });
    });

    it('should send an "attempt failed" event if the provided kuzzle response does not contain a token', function (done) {
      kuzzle.setJwtToken({foo: 'bar'});

      process.nextTick(() => {
        should(kuzzle.getJwtToken()).be.undefined();
        should(subscriptionsRenewed).be.false();
        should(eventEmitted).be.true();
        should(loginStatus.success).be.false();
        should(loginStatus.error).not.be.undefined();
        done();
      });
    });
  });

  describe('#refreshIndex', function () {
    beforeEach(() => {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if no index is set', () => {
      should(() => {kuzzle.refreshIndex();}).throw('Kuzzle.refreshIndex: index required');
    });

    it('should use the default index if no index is given', () => {
      var
        spy = sandbox.stub(kuzzle, 'query').returns();

      kuzzle.defaultIndex = 'defaultIndex';
      kuzzle.refreshIndex();

      should(spy.calledOnce).be.true();
      should(spy.firstCall.args[0].index).be.exactly(kuzzle.defaultIndex);
    });

    it('should parse the given parameters', () => {
      var
        spy = sandbox.stub(kuzzle, 'query').returns(),
        index = 'index',
        options = {foo: 'bar'},
        cb = () => {},
        args;

      kuzzle.refreshIndex(index, options, cb);

      should(spy.calledOnce).be.true();
      args = spy.firstCall.args;

      should(args[0].index).be.exactly(index);
      should(args[0].controller).be.exactly('admin');
      should(args[0].action).be.exactly('refreshIndex');
      should(args[2]).be.exactly(options);
      should(args[3]).be.exactly(cb);
    });

  });

  describe('#getAutoRefresh', () => {
    beforeEach(() => {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if no index is given', () => {
      should(() => { kuzzle.getAutoRefresh(); }).throw('Kuzzle.getAutoRefresh: index required');
    });

    it('should use kuzzle default index if no index is provided', () => {
      var
        spy = sandbox.stub(kuzzle, 'query').returns();

      kuzzle.defaultIndex = 'defaultIndex';

      kuzzle.getAutoRefresh(() => {});

      should(spy.calledOnce).be.true();
      should(spy.firstCall.args[0].index).be.exactly(kuzzle.defaultIndex);

    });

    it('should throw an error if no callback is given', () => {
      should(() => { kuzzle.getAutoRefresh('index'); }).throw('Kuzzle.getAutoRefresh: a callback argument is required for read queries');
    });

    it('should parse the given arguments', () => {
      var
        spy = sandbox.stub(kuzzle, 'query').returns(),
        index = 'index',
        options = { foo: 'bar'},
        cb = () => {};

      kuzzle.getAutoRefresh(index, options, cb);
      should(spy.calledOnce).be.true();
      should(spy.calledWithExactly(
        { index: index, controller: 'admin', action: 'getAutoRefresh' },
        {},
        options,
        cb)
      ).be.true();

      kuzzle.defaultIndex = 'defaultIndex';
      kuzzle.getAutoRefresh(cb);
      should(spy.calledTwice).be.true();
      should(spy.secondCall.calledWithExactly(
        { index: kuzzle.defaultIndex, controller: 'admin', action: 'getAutoRefresh' },
        {},
        undefined,
        cb)
      ).be.true();

    });

  });

  describe('#setAutoRefresh', () => {
    beforeEach(() => {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if no index is given', () => {
      should(() => { kuzzle.setAutoRefresh(); }).throw('Kuzzle.setAutoRefresh: index required');
    });

    it('should use kuzzle default index if none is provided', () => {
      var
        spy = sandbox.stub(kuzzle, 'query').returns(),
        cb = () => {};

      kuzzle.defaultIndex = 'defaultIndex';
      kuzzle.setAutoRefresh(true, cb);
      should(spy.calledOnce).be.true();
      should(spy.calledWith(
        { index: kuzzle.defaultIndex, controller: 'admin', action: 'setAutoRefresh' },
        { body: { autoRefresh: true } },
        undefined,
        cb
      )).be.true();

    });

    it('should throw an error is now autorefresh value is given', () => {
      should(() => {
        kuzzle.setAutoRefresh('index');
      }).throw('Kuzzle.setAutoRefresh: autoRefresh value is required');
    });

    it('should parse the given arguments', () => {
      var
        index = 'index',
        autoRefresh = true,
        options = { foo: 'bar'},
        cb = () => {},
        spy = sandbox.stub(kuzzle, 'query').returns();

      kuzzle.defaultIndex = 'defaultIndex';

      kuzzle.setAutoRefresh(autoRefresh, options, cb);
      should(spy.calledOnce).be.true();
      should(spy.firstCall.calledWithExactly(
        { index: kuzzle.defaultIndex, controller: 'admin', action: 'setAutoRefresh' },
        { body: { autoRefresh: autoRefresh }},
        options,
        cb
      )).be.true();

      kuzzle.setAutoRefresh(index, autoRefresh);
      should(spy.calledTwice).be.true();
      should(spy.secondCall.calledWithExactly(
        { index: index, controller: 'admin', action: 'setAutoRefresh' },
        { body: { autoRefresh: autoRefresh }},
        undefined,
        undefined
      )).be.true();
    });

  });

});
