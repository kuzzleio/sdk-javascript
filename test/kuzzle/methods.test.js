var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  sandbox = sinon.sandbox.create(),
  Kuzzle = rewire('../../src/Kuzzle'),
  Collection = require('../../src/Collection.js');

describe('Kuzzle methods', function () {
  var
    error,
    result,
    kuzzle,
    queryStub = function (queryArgs, query, options, cb) {
      if (!cb && typeof options === 'function') {
        cb = options;
        options = null;
      }
      if (cb && typeof cb === 'function') {
        cb(error, result);
      }
    };

  beforeEach(function () {
    kuzzle = new Kuzzle('foo');
    result = null;
    error = null;
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#collection', function () {
    it('should throw an error if arguments are not strings', function () {
      kuzzle.defaultIndex = 'foobar';
      should(function () {
        kuzzle.collection(undefined);
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection(undefined, 'foo');
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection(null);
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection(null, 'foo');
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection(123);
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection(123, 'foo');
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection('foo', 123);
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection({foo: 'bar'});
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection({foo: 'bar'}, 'foo');
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection('foo', {foo: 'bar'});
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection(['bar']);
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection('foo', ['bar']);
      }).throw(/string expected/);
      should(function () {
        kuzzle.collection(['bar'], 'foo');
      }).throw(/string expected/);
    });

    it('should throw an error if the kuzzle instance has been invalidated', function () {
      kuzzle.state = 'disconnected';
      should(function () {
        kuzzle.collection('foo');
      }).throw(Error);
    });

    it('should throw an error if no index is provided and no default index has been set', function () {
      should(function () {
        kuzzle.collection('foo');
      }).throw(/no index specified/);
    });

    it('should create and store the data collection instance', function () {
      var collection = kuzzle.collection('foo', 'bar');

      should(kuzzle.collections.bar.foo).not.be.undefined().and.be.instanceof(Collection);
      should(collection).be.instanceof(Collection);
    });

    it('should simply pull the collection from the collection history if reinvoked', function () {
      kuzzle.collections.foo = {bar: 'qux'};
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

  describe('#createIndex', function () {
    beforeEach(function () {
      sandbox.stub(kuzzle, 'query').callsFake(queryStub);
      result = {result: {acknowledged: true}};
    });

    it('should throw an error if no index is given and no defaultIndex is set', function () {
      should(function () {
        kuzzle.createIndex();
      }).throw('Kuzzle.createIndex: index required');
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
      sandbox.stub(kuzzle, 'query').callsFake(queryStub);
      result = {
        result: 'foobar'
      };
    });

    it('should throw an error if no index is given and no defaultIndex is set', function () {
      should(function () {
        kuzzle.getAutoRefresh();
      }).throw('Kuzzle.getAutoRefresh: index required');
    });

    it('should throw an error if no callback is provided', function () {
      should(function () {
        kuzzle.getAutoRefresh('index');
      }).throw(Error);
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
        options = {foo: 'bar'},
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

  describe('#getJwt', function () {
    it('should return the current token', function () {
      kuzzle.jwt = 'testToken';
      should(kuzzle.getJwt()).be.exactly('testToken');
    });
  });

  describe('#listCollections', function () {
    var expectedQuery = {
      index: 'foo',
      controller: 'collection',
      action: 'list'
    };

    beforeEach(function () {
      sandbox.stub(kuzzle, 'query').callsFake(queryStub);
      result = {result: {collections: {stored: [], realtime: []}}};
    });

    it('should throw an error if no callback has been provided', function () {
      should(function () {
        kuzzle.listCollections('foo');
      }).throw(Error);
      should(function () {
        kuzzle.listCollections('foo', {});
      }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should throw an error if no index has been provided', function () {
      should(function () {
        kuzzle.listCollections(sinon.stub());
      }).throw(Error);
      should(function () {
        kuzzle.listCollections({}, sinon.stub());
      }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the query function with the right arguments', function () {
      var cb = sinon.stub();

      result = {result: {collections: {stored: ['foo', 'bar', 'baz'], realtime: ['qux']}}};

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
      sandbox.stub(kuzzle, 'query').callsFake(queryStub);
      result = {result: {indexes: ['foo', 'bar']}};
    });

    it('should throw an error if no callback is provided', function () {
      should(function () {
        kuzzle.listIndexes();
      }).throw(Error);
      should(kuzzle.query).not.be.called();

      should(function () {
        kuzzle.listIndexes({some: 'options'});
      }).throw(Error);
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

  describe('#refreshIndex', function () {
    beforeEach(function () {
      sandbox.stub(kuzzle, 'query').callsFake(queryStub);
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
      should(function () {
        kuzzle.refreshIndex();
      }).throw('Kuzzle.refreshIndex: index required');
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

  describe('#setAutoRefresh', function () {
    beforeEach(function () {
      sandbox.stub(kuzzle, 'query').callsFake(queryStub);
      result = {
        result: 'foobar'
      };
    });

    it('should throw an error if no index is given', function () {
      should(function () {
        kuzzle.setAutoRefresh();
      }).throw('Kuzzle.setAutoRefresh: index required');
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
        options = {foo: 'bar'},
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

  describe('#setDefaultIndex', function () {
    it('should throw an error if the provided index is not a string', function () {
      should((function () {
        kuzzle.setDefaultIndex();
      })).throw();
      should((function () {
        kuzzle.setDefaultIndex({});
      })).throw();
      should((function () {
        kuzzle.setDefaultIndex([]);
      })).throw();
      should((function () {
        kuzzle.setDefaultIndex(123);
      })).throw();
      should((function () {
        kuzzle.setDefaultIndex(null);
      })).throw();
      should((function () {
        kuzzle.setDefaultIndex(undefined);
      })).throw();
    });

    it('should throw an error if the provided index is an empty string', function () {
      should((function () {
        kuzzle.setDefaultIndex('');
      })).throw();
    });

    it('should set the default index in all other cases', function () {
      should(kuzzle.setDefaultIndex('foo')).be.eql(kuzzle);
      should(kuzzle.defaultIndex).be.eql('foo');
    });
  });

  describe('#setJwt', function () {
    it('should set the token when provided with a string argument', function () {
      kuzzle.setJwt('foobar');

      should(kuzzle.jwt).be.eql('foobar');
    });

    it('should set the token when provided with a kuzzle response argument', function () {
      kuzzle.setJwt({result: {jwt: 'foobar'}});

      should(kuzzle.jwt).be.eql('foobar');
    });

    it('should throw if provided with an invalid argument type', function (done) {
      try {
        kuzzle.setJwt();
      } catch (e) {
        should(e.message).be.eql('Invalid token argument: undefined');
        done();
      }
    });

    it('should throw if the provided kuzzle response does not contain a token', function (done) {
      try {
        kuzzle.setJwt({foo: 'bar'});
      } catch (e) {
        should(e.message).be.eql('Cannot find a valid JWT in the following object: {"foo":"bar"}');
        done();
      }
    });
  });

  describe('#unsetJwt', function () {
    it('should unset the token', function () {
      kuzzle.jwt = 'testToken';
      kuzzle.unsetJwt();
      should(kuzzle.jwt).be.undefined();
    });
  });

});
