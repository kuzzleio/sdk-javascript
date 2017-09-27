var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  sandbox = sinon.sandbox.create(),
  Kuzzle = rewire('../../src/Kuzzle'),
  Collection = require('../../src/Collection.js'),
  User = require('../../src/security/User');

describe('Kuzzle methods', function () {
  var queryStub = function(queryArgs, query, options, cb) {
      if (!cb && typeof options === 'function') {
        cb = options;
        options = null;
      }
      if (cb && typeof cb === 'function') {
        cb(error, result);
      }
    },
    error,
    result,
    kuzzle;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    sandbox.stub(kuzzle, 'query').callsFake(queryStub);
    result = null;
    error = null;
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#getAllStatistics', function () {
    var expectedQuery = {
      controller: 'server',
      action: 'getAllStats'
    };

    beforeEach(function () {
      result = {result: {hits: ['foo', 'bar']}};
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getAllStatistics(); }).throw(Error);
      should(kuzzle.query).not.be.called();
      should(function () { kuzzle.getAllStatistics({some: 'options'}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the query function with the right arguments', function () {
      var
        cb = sinon.stub(),
        options = {queuable: true, volatile: {foo: 'bar'}};

      kuzzle.getAllStatistics(cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, null);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, ['foo', 'bar']);

      cb.reset();
      kuzzle.query.resetHistory();

      kuzzle.getAllStatistics(options, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, options);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, ['foo', 'bar']);
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.getAllStatistics(cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar', undefined);
    });
  });

  describe('#getStatistics', function () {
    beforeEach(function () {
      result = {result: {hits: ['foo', 'bar']}};
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getStatistics(); }).throw(Error);
      should(function () { kuzzle.getStatistics(123456); }).throw(Error);
      should(function () { kuzzle.getStatistics({}); }).throw(Error);
      should(function () { kuzzle.getStatistics(123456, {}); }).throw(Error);
    });

    it('should call the query function with getLastStats action if no timestamp is given', function () {
      var
        cb = sinon.stub(),
        expectedQuery = {
          controller: 'server',
          action: 'getLastStats'
        },
        options = {queuable: true, volatile: {foo: 'bar'}};

      result = {result: {foo: 'bar'}};

      kuzzle.getStatistics(cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, null);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, [{foo: 'bar'}]);

      cb.reset();
      kuzzle.query.resetHistory();

      kuzzle.getStatistics(options, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, options);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, [{foo: 'bar'}]);
    });

    it('should return statistics frames starting from the given timestamp', function () {
      var hits = [
          {123: {}},
          {456: {}},
          {789: {}}
        ],
        cb = sinon.stub(),
        options = {queuable: true, volatile: {foo: 'bar'}},
        expectedQuery = {
          controller: 'server',
          action: 'getStats'
        };

      result = {result: {hits: hits}};

      kuzzle.getStatistics(123, options, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: {startTime: 123 }}, options);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, hits);
    });

    it('should execute the provided callback with an error argument if one occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.getStatistics(cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar');
      error = 'foobar';
    });
  });

  describe('#collection', function () {
    it('should throw an error if arguments are not strings', function () {
      kuzzle.defaultIndex = 'foobar';
      should(function () { kuzzle.collection(undefined); }).throw(/string expected/);
      should(function () { kuzzle.collection(undefined, 'foo'); }).throw(/string expected/);
      should(function () { kuzzle.collection(null); }).throw(/string expected/);
      should(function () { kuzzle.collection(null, 'foo'); }).throw(/string expected/);
      should(function () { kuzzle.collection(123); }).throw(/string expected/);
      should(function () { kuzzle.collection(123, 'foo'); }).throw(/string expected/);
      should(function () { kuzzle.collection('foo', 123); }).throw(/string expected/);
      should(function () { kuzzle.collection({foo: 'bar'}); }).throw(/string expected/);
      should(function () { kuzzle.collection({foo: 'bar'}, 'foo'); }).throw(/string expected/);
      should(function () { kuzzle.collection('foo', {foo: 'bar'}); }).throw(/string expected/);
      should(function () { kuzzle.collection(['bar']); }).throw(/string expected/);
      should(function () { kuzzle.collection('foo', ['bar']); }).throw(/string expected/);
      should(function () { kuzzle.collection(['bar'], 'foo'); }).throw(/string expected/);
    });

    it('should throw an error if the kuzzle instance has been invalidated', function () {
      kuzzle.state = 'disconnected';
      should(function () { kuzzle.collection('foo'); }).throw(Error);
    });

    it('should throw an error if no index is provided and no default index has been set', function () {
      should(function () { kuzzle.collection('foo'); }).throw(/no index specified/);
    });

    it('should create and store the data collection instance', function () {
      var collection = kuzzle.collection('foo', 'bar');

      should(kuzzle.collections.bar.foo).not.be.undefined().and.be.instanceof(Collection);
      should(collection).be.instanceof(Collection);
    });

    it('should simply pull the collection from the collection history if reinvoked', function () {
      kuzzle.collections.foo = { bar: 'qux'};
      should(kuzzle.collection('bar', 'foo')).be.a.String().and.be.exactly('qux');
    });

    it('should use the default index if no index is provided', function () {
      var
        collection;

      kuzzle.defaultIndex = 'bar';
      collection = kuzzle.collection('foo');
      should(collection).be.instanceof(Collection);
      should(collection.index).be.eql('bar');
    });
  });

  describe('#getServerInfo', function () {
    var expectedQuery = {
      controller: 'server',
      action: 'info'
    };

    beforeEach(function () {
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
    });

    it('should throw an error if no callback is provided', function () {
      should(function () {kuzzle.getServerInfo();}).throw(Error);
      should(function () {kuzzle.getServerInfo({some: 'options'});}).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the query function with the right arguments', function () {
      var
        cb = sinon.stub(),
        options = {queuable: true, volatile: {foo: 'bar'}};

      kuzzle.getServerInfo(cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, null);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result.result.serverInfo);

      kuzzle.query.resetHistory();
      cb.reset();

      kuzzle.getServerInfo(options, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, options);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result.result.serverInfo);
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.getServerInfo(cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar', undefined);
    });
  });

  describe('#listCollections', function () {
    var expectedQuery = {
      index: 'foo',
      controller: 'collection',
      action: 'list'
    };

    beforeEach(function () {
      result = {result: {collections: {stored: [], realtime: []}}};
    });

    it('should throw an error if no callback has been provided', function () {
      should(function () { kuzzle.listCollections('foo'); }).throw(Error);
      should(function () { kuzzle.listCollections('foo', {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should throw an error if no index has been provided', function () {
      should(function () {kuzzle.listCollections(sinon.stub());}).throw(Error);
      should(function () {kuzzle.listCollections({}, sinon.stub());}).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the query function with the right arguments', function () {
      var cb = sinon.stub();

      result = { result: {collections: {stored: ['foo', 'bar', 'baz'], realtime: ['qux'] } } };

      kuzzle.listCollections('foo', cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {type: 'all'});
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result.result.collections);

      cb.reset();
      kuzzle.query.resetHistory();

      kuzzle.listCollections('foo', {type: 'foobar'}, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {type: 'foobar'});
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result.result.collections);
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.listCollections('foo', cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar', undefined);
    });

    it('should use the default index if none is provided', function () {
      kuzzle.defaultIndex = 'foo';
      kuzzle.listCollections(sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery);
    });
  });

  describe('#listIndexes', function () {
    var expectedQuery = {
      controller: 'index',
      action: 'list'
    };

    beforeEach(function () {
      result = {result: {indexes: ['foo', 'bar']}};
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.listIndexes(); }).throw(Error);
      should(kuzzle.query).not.be.called();

      should(function () {kuzzle.listIndexes({some: 'options'});}).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the query function with the right arguments', function () {
      var
        cb = sinon.stub(),
        options = {queuable: true, volatile: {foo: 'bar'}};

      kuzzle.listIndexes(cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, null);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, ['foo', 'bar']);

      cb.reset();
      kuzzle.query.resetHistory();

      kuzzle.listIndexes(options, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, options);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, ['foo', 'bar']);
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.listIndexes(cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar', undefined);
    });
  });

  describe('#now', function () {
    var expectedQuery = {
      controller: 'server',
      action: 'now'
    };

    beforeEach(function () {
      result = {result: {now: Date.now()}};
    });

    it('should throw an error if called without a callback', function () {
      should(function () { kuzzle.now(); }).throw(Error);
      should(kuzzle.query).not.be.called();
      should(function () { kuzzle.now({}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call query with the right arguments', function () {
      var cb = sinon.stub();

      kuzzle.now(cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result.result.now);

      cb.reset();
      kuzzle.query.resetHistory();

      kuzzle.now({foo: 'bar'}, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, {foo: 'bar'});
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result.result.now);
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.now(cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar', undefined);
    });
  });

  describe('#setDefaultIndex', function () {
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

      kuzzle.setHeaders({bar: 'foo'}, true);
      should(kuzzle.headers).match({bar: 'foo'});
      should(kuzzle.headers).not.match({foo: 'bar'});

      kuzzle.setHeaders({}, true);
      should(kuzzle.headers).be.empty();
    });
  });

  describe('#checkToken', function () {
    var token = 'fakeToken-eoijaodmowifnw8h';

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.checkToken(); }).throw(Error);
      should(kuzzle.query).not.be.called();
      should(function () { kuzzle.checkToken(token); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call query with the right arguments', function () {
      var
        now = Date.now(),
        cb = sinon.stub(),
        expectedQuery = {
          controller: 'auth',
          action: 'checkToken'
        };

      result = {
        result: {
          valid: true,
          state: 'Error message',
          expiresAt: now + 1000
        }
      };

      kuzzle.checkToken(token,cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: {token: token}}, {queuable: false});
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result.result);
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.checkToken(token, cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar', undefined);
    });
  });

  describe('#whoAmI', function () {
    beforeEach(function() {
      result = {
        result: {
          _id: 'foobar',
          _source: {
            name: {
              first: 'John',
              last: 'Doe'
            },
            profile: {
              _id: 'default',
              roles: [
                {_id: 'default'}
              ]
            }
          }
        }
      };
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.whoAmI(); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call query with the right arguments', function () {
      var
        cb = sinon.stub(),
        user = new User(kuzzle.security, 'foobar', result.result._source),
        expectedQuery = {
          controller: 'auth',
          action: 'getCurrentUser'
        };

      kuzzle.whoAmI(cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, {});
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, user);
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.whoAmI(cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar', undefined);
    });
  });

  describe('#updateSelf', function () {
    var expectedQuery = {
      action: 'updateSelf',
      controller: 'auth'
    };

    beforeEach(function () {
      result = {
        result: {
          _id: 'foobar',
          _source: {
            name: {
              first: 'John',
              last: 'Doe'
            }
          }
        }
      };
    });

    it('should send the right query to Kuzzle even without callback', function () {
      kuzzle.updateSelf({foo: 'bar'});
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: {foo: 'bar'}});
    });

    it('should send the right query to Kuzzle', function () {
      var cb = sinon.stub();

      kuzzle.updateSelf({foo: 'bar'}, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: {foo: 'bar'}});
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result.result);

    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.updateSelf({foo: 'bar'}, cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly('foobar', undefined);
    });
  });

  describe('#getJwtToken', function () {
    it('should return the current jwt token', function () {
      kuzzle.jwtToken = 'testToken';
      should(kuzzle.getJwtToken()).be.exactly('testToken');
    });
  });

  describe('#unsetJwtToken', function () {
    var removeAllSubscriptionsStub = sinon.stub();

    it('should unset the token and call removeAllSubscriptions', function () {
      Kuzzle.__with__({
        'removeAllSubscriptions': removeAllSubscriptionsStub
      })(function() {
        kuzzle.jwtToken = 'testToken';
        kuzzle.unsetJwtToken();
        should(removeAllSubscriptionsStub).be.calledOnce();
        should(kuzzle.jwtToken).be.undefined();
      }
      );
    });

    it('should unsubscribe all rooms when un-setting token', function () {
      var
        stubKuzzleRoom = {
          unsubscribe: sinon.stub()
        };

      kuzzle.subscriptions.foo = { bar: stubKuzzleRoom };

      kuzzle.unsetJwtToken();

      should(stubKuzzleRoom.unsubscribe).be.calledOnce();
    });
  });

  describe('#setJwtToken', function () {
    var
      revert,
      renewAllSubscriptionsStub = sinon.stub(),
      loginAttemptStub = sinon.stub();

    before(function () {
      revert = Kuzzle.__set__('renewAllSubscriptions', renewAllSubscriptionsStub);
    });

    beforeEach(function () {
      renewAllSubscriptionsStub.reset();
      loginAttemptStub.reset();
      kuzzle.addListener('loginAttempt', loginAttemptStub);
    });

    after(function () {
      revert();
    });

    it('should set the token when provided with a string argument', function () {
      kuzzle.setJwtToken('foobar');

      should(kuzzle.jwtToken).be.eql('foobar');
      should(renewAllSubscriptionsStub).be.calledOnce();
      should(loginAttemptStub).be.calledOnce();
      should(loginAttemptStub).be.calledWith({success: true});
    });

    it('should set the token when provided with a kuzzle response argument', function () {
      kuzzle.setJwtToken({result:{jwt: 'foobar'}});

      should(kuzzle.jwtToken).be.eql('foobar');
      should(renewAllSubscriptionsStub).be.calledOnce();
      should(loginAttemptStub).be.calledOnce();
      should(loginAttemptStub).be.calledWith({success: true});
    });

    it('should send an "attempt failed" event if provided with an invalid argument type', function () {
      kuzzle.setJwtToken();

      should(kuzzle.jwtToken).be.undefined();
      should(renewAllSubscriptionsStub).not.be.calledOnce();
      should(loginAttemptStub).be.calledOnce();
      should(loginAttemptStub).be.calledWith({ error: 'Invalid token argument: undefined', success: false });
    });

    it('should send an "attempt failed" event if the provided kuzzle response does not contain a token', function () {
      kuzzle.setJwtToken({foo: 'bar'});

      should(kuzzle.jwtToken).be.undefined();
      should(renewAllSubscriptionsStub).not.be.calledOnce();
      should(loginAttemptStub).be.calledOnce();
      should(loginAttemptStub).be.calledWith({ error: 'Cannot find a valid JWT token in the following object: {"foo":"bar"}', success: false });
    });
  });

  describe('#refreshIndex', function () {
    beforeEach(function() {
      result = {
        result: {
          _shards: {
            failed: 0,
            succressful: 5,
            total: 10
          }
        }
      };
    });

    it('should throw an error if no index is given and no defaultIndex is set', function () {
      should(function () {kuzzle.refreshIndex();}).throw('Kuzzle.refreshIndex: index required');
    });

    it('should send the right query to Kuzzle even without callback', function () {
      var expectedQuery = {
        controller: 'index',
        action: 'refresh',
        index: 'foobar'
      };

      kuzzle.refreshIndex('foobar');
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery);
    });

    it('should use the default index if no index is given', function () {
      var expectedQuery = {
        controller: 'index',
        action: 'refresh',
        index: 'defaultIndex'
      };

      kuzzle.defaultIndex = 'defaultIndex';
      kuzzle.refreshIndex();

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery);
    });

    it('should send the right query to Kuzzle', function () {
      var
        cb = sinon.stub(),
        expectedQuery = {
          controller: 'index',
          action: 'refresh',
          index: 'foobar'
        };

      kuzzle.refreshIndex('foobar', cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {});
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, result);
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.refreshIndex('index', cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWith('foobar');
    });
  });

  describe('#createIndex', function () {
    beforeEach(function () {
      result = {result: {acknowledged: true}};
    });

    it('should throw an error if no index is given and no defaultIndex is set', function () {
      should(function () { kuzzle.createIndex(); }).throw('Kuzzle.createIndex: index required');
    });

    it('should send the right query to Kuzzle even without callback', function () {
      var expectedQuery = {
        controller: 'index',
        action: 'create',
        index: 'foobar'
      };

      kuzzle.createIndex('foobar');
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery);
    });

    it('should use the default index if no index is given', function () {
      var
        expectedQuery = {
          controller: 'index',
          action: 'create',
          index: 'defaultIndex'
        };

      kuzzle.defaultIndex = 'defaultIndex';
      kuzzle.createIndex();

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery);
    });

    it('should send the right query to Kuzzle', function () {
      var
        cb = sinon.stub(),
        expectedQuery = {
          controller: 'index',
          action: 'create',
          index: 'foobar'
        };

      kuzzle.createIndex('foobar', cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {});
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, {acknowledged: true});
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.createIndex('index', cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWith('foobar');
    });
  });

  describe('#getAutoRefresh', function () {
    beforeEach(function () {
      result = {
        result: 'foobar'
      };
    });

    it('should throw an error if no index is given and no defaultIndex is set', function () {
      should(function () { kuzzle.getAutoRefresh(); }).throw('Kuzzle.getAutoRefresh: index required');
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getAutoRefresh('index'); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should use the default index if no index is given', function () {
      var
        cb = sinon.stub(),
        expectedQuery = {
          controller: 'index',
          action: 'getAutoRefresh',
          index: 'defaultIndex'
        };

      kuzzle.defaultIndex = 'defaultIndex';
      kuzzle.getAutoRefresh(cb);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, {result: 'foobar'});
    });

    it('should send the right query to Kuzzle', function () {
      var
        cb = sinon.stub(),
        options = { foo: 'bar'},
        expectedQuery = {
          controller: 'index',
          action: 'getAutoRefresh',
          index: 'foobar'
        };

      kuzzle.getAutoRefresh('foobar', options, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, options);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, {result: 'foobar'});
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.getAutoRefresh('foobar', cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWith('foobar');
    });
  });

  describe('#setAutoRefresh', function () {
    beforeEach(function () {
      result = {
        result: 'foobar'
      };
    });

    it('should throw an error if no index is given', function () {
      should(function () { kuzzle.setAutoRefresh(); }).throw('Kuzzle.setAutoRefresh: index required');
    });

    it('should throw an error is now autorefresh value is given', function () {
      should(function () {
        kuzzle.setAutoRefresh('foobar');
      }).throw('Kuzzle.setAutoRefresh: autoRefresh value is required');
    });

    it('should send the right query to Kuzzle even without callback', function () {
      var expectedQuery = {
        controller: 'index',
        action: 'setAutoRefresh',
        index: 'foobar'
      };
      kuzzle.setAutoRefresh('foobar', true);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: {autoRefresh: true}});
    });

    it('should use kuzzle default index if none is provided', function () {
      var expectedQuery = {
          controller: 'index',
          action: 'setAutoRefresh',
          index: 'defaultIndex'
        },
        cb = sinon.stub();

      kuzzle.defaultIndex = 'defaultIndex';
      kuzzle.setAutoRefresh(true, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: {autoRefresh: true}});
      should(cb).be.calledOnce();
      should(cb).be.calledWith(null, {result: 'foobar'});

    });

    it('should send the right query to Kuzzle', function () {
      var
        cb = sinon.stub(),
        options = { foo: 'bar'},
        expectedQuery = {
          controller: 'index',
          action: 'setAutoRefresh',
          index: 'foobar'
        };

      kuzzle.setAutoRefresh('foobar', true, options, cb);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: {autoRefresh: true}}, options);
      should(cb).be.calledOnce();
      should(cb).be.calledWithExactly(null, {result: 'foobar'});
    });

    it('should execute the callback with an error if an error occurs', function () {
      var cb = sinon.stub();

      error = 'foobar';
      kuzzle.setAutoRefresh('foobar', true, cb);
      should(cb).be.calledOnce();
      should(cb).be.calledWith('foobar');
    });
  });

  describe('#createMyCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.createMyCredentials('strategy', {foo: 'bar'}, function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('createMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = {_id: '42'},
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: {_source: doc}}),
        args;

      kuzzle.createMyCredentials('strategy', {foo: 'bar'}, function (err, res) {
        should(res).be.exactly(doc);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('createMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#deleteMyCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.deleteMyCredentials('strategy', function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('deleteMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: {acknowledged: true}}),
        args;

      kuzzle.deleteMyCredentials('strategy', function (err, res) {
        should(res.acknowledged).be.exactly(true);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('deleteMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#getMyCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.getMyCredentials('strategy', function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('getMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = {_id: '42'},
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: doc}),
        args;

      kuzzle.getMyCredentials('strategy', function (err, res) {
        should(res).be.exactly(doc);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('getMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#updateMyCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.updateMyCredentials('strategy', {username: 'foo'}, function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('updateMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = {username: 'foo'},
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: doc}),
        args;

      kuzzle.updateMyCredentials('strategy', doc, function (err, res) {
        should(res).be.exactly(doc);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('updateMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#validateMyCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.validateMyCredentials('strategy', {username: 'foo'}, function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('validateMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = {username: 'foo'},
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: true}),
        args;

      kuzzle.validateMyCredentials('strategy', doc, function (err, res) {
        should(res).be.exactly(true);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('auth');
        should(args[0].action).be.exactly('validateMyCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

});
