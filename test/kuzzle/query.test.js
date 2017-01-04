var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle'),
  EventEmitter = require('events').EventEmitter,
  kuzzleSource = '../../src/Kuzzle';


describe('Query management', function () {
  describe('#emitRequest', function () {
    var
      emitRequest = rewire(kuzzleSource).__get__('emitRequest'),
      kuzzle;

    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.network = new EventEmitter;
      kuzzle.network.send = sinon.stub();
    });

    it('should emit the request when asked to', function () {
      var
        start = Date.now(),
        request = {requestId: 'bar'};

      emitRequest.call(kuzzle, request);
      should(kuzzle.network.send.calledWith(request)).be.true();
      should(kuzzle.requestHistory.bar).be.within(start, Date.now());
    });

    it('should fire a jwtTokenExpired event if the token has expired', function (done) {
      var listenerJwtTokenExpired = false;

      kuzzle.network.send = () => process.nextTick(() => kuzzle.network.emit('bar', {
        error: {
          message: 'Token expired'
        }
      }));

      kuzzle.addListener('jwtTokenExpired', function() {
        listenerJwtTokenExpired = true;
      });

      this.timeout(150);

      emitRequest.call(kuzzle, {requestId: 'bar'}, function(error) {
        process.nextTick(() => {
          should(listenerJwtTokenExpired).be.exactly(true);
          should(error.message).be.exactly('Token expired');
          done();
        });
      });
    });

    it('should fire a queryError if an error occurred', function (done) {
      var listenerQueryError = false;

      kuzzle.network.send = () => process.nextTick(() => kuzzle.network.emit('bar', {
        error: {
          message: 'foo-bar'
        }
      }));

      kuzzle.addListener('queryError', function() {
        listenerQueryError = true;
      });

      this.timeout(150);

      emitRequest.call(kuzzle, {requestId: 'bar'}, function(error) {
        process.nextTick(() => {
          should(listenerQueryError).be.exactly(true);
          should(error.message).be.exactly('foo-bar');
          done();
        });
      });
    });

    it('should launch the callback once a response has been received', function (done) {
      var
        response = {result: 'foo', error: {foo: 'bar', message: 'foobar'}, status: 42},
        request = {requestId: 'someEvent'},
        cb = function (err, res) {
          should(err).be.instanceOf(Error);
          should(err.message).be.exactly(response.error.message);
          should(err.stack).be.a.String();
          should(err.foo).be.exactly('bar');
          should(err.status).be.exactly(42);
          should(res).be.exactly(response);
          done();
        };

      this.timeout(50);

      kuzzle.network.send = () => process.nextTick(() => kuzzle.network.emit(request.requestId, response));
      emitRequest.call(kuzzle, request, cb);
    });
  });

  describe('#query', function () {
    var
      requestObject,
      emitted,
      callback,
      queryArgs = {
        controller: 'controller',
        action: 'action',
        collection: 'collection',
        index: 'index'
      },
      kuzzle;

    before(function () {
      Kuzzle = rewire(kuzzleSource);
      Kuzzle.__set__('emitRequest', function (object, cb) {
        emitted = true;
        requestObject = object;
        callback = cb;
      });
    });

    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.state = 'connected';
      requestObject = {};
      callback = null;
      emitted = false;
    });

    it('should generate a valid request object', function () {
      kuzzle.query(queryArgs, { body: { some: 'query'}});
      should(requestObject.index).be.exactly('index');
      should(requestObject.controller).be.exactly('controller');
      should(requestObject.collection).be.exactly('collection');
      should(requestObject.action).be.exactly('action');
      should(requestObject.body).match({some: 'query'});
      should(requestObject.requestId).not.be.undefined().and.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should manage arguments properly if no options are provided', function () {
      var cb = function () {};

      kuzzle.query(queryArgs, { body: { some: 'query'}}, cb);

      should(callback).be.exactly(cb);
    });

    it('should invoke the callback with an error if no query is provided', () => {
      should(() => kuzzle.query(queryArgs, () => {})).throw(Error);
      should(() => kuzzle.query(queryArgs, ['foo', 'bar'])).throw(Error);
      should(() => kuzzle.query(queryArgs)).throw(Error);
      should(() => kuzzle.query(queryArgs, 'foobar')).throw(Error);
    });

    it('should handle options metadata properly', function () {
      var
        metadata = {
          foo: 'bar',
          baz: ['foo', 'bar', 'qux']
        };

      kuzzle.query(queryArgs, { body: { some: 'query'}}, {metadata: metadata});
      should(requestObject.metadata).match(metadata);
    });

    it('should handle option refresh properly', function () {
      var
        refresh = 'foo';

      kuzzle.query(queryArgs, { body: { some: 'query'}}, {refresh: refresh});
      should(requestObject.refresh).match(refresh);
    });

    it('should handle option size properly', function () {
      var
        size = 'foo';

      kuzzle.query(queryArgs, { body: { some: 'query'}}, {size: size});
      should(requestObject.size).match(size);
    });

    it('should handle option from properly', function () {
      var
        from = 'foo';

      kuzzle.query(queryArgs, { body: { some: 'query'}}, {from: from});
      should(requestObject.from).match(from);
    });

    it('should exit early if the query is not queuable and the SDK is offline', function () {
      kuzzle.state = 'offline';
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false});
      should(emitted).be.false();
    });

    it('should copy query local metadata over optional ones', function () {
      var
        metadata = {
          foo: 'bar',
          baz: ['foo', 'bar', 'qux']
        };

      kuzzle.query(queryArgs, { body: { some: 'query'}, metadata: {foo: 'foo'}}, {metadata: metadata});
      should(requestObject.metadata.foo).be.exactly('foo');
      should(requestObject.metadata.baz).match(metadata.baz);
    });

    it('should not define optional members if none was provided', function () {
      kuzzle.query({controller: 'foo', action: 'bar'}, { body: { some: 'query'}});
      should(requestObject.collection).be.undefined();
      should(requestObject.index).be.undefined();
    });

    it('should add global headers without overwriting any existing query headers', function () {
      kuzzle.headers = { foo: 'bar', bar: 'foo' };
      kuzzle.query(queryArgs, { foo: 'foo', body: {some: 'query'}});
      should(requestObject.foo).be.exactly('foo');
      should(requestObject.bar).be.exactly('foo');
    });

    it('should not generate a new request ID if one is already defined', function () {
      kuzzle.query(queryArgs, { body: { some: 'query'}, requestId: 'foobar'});
      should(requestObject.requestId).be.exactly('foobar');
    });

    it('should emit the request directly without waiting the end of dequeuing if queuable is false', function () {
      kuzzle.state = 'connected';
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false});
      should(emitted).be.true();

      emitted = false;
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false});
      should(emitted).be.true();
    });

    it('should discard the request if not connected and if queuable is false', function () {
      var
        errorRaised = false;

      callback = () => {
        errorRaised = true;
      };

      kuzzle.state = 'reconnecting';
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false}, callback);
      should(emitted).be.false();
      should(errorRaised).be.true();

      errorRaised = false;
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false}, callback);
      should(emitted).be.false();
      should(errorRaised).be.true();
    });

    it('should queue the request during offline mode, if queuing has been activated', function (done) {
      var
        query = { body: { some: 'query'}},
        cb = function () {},
        now = Date.now(),
        eventFired = false;

      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.addListener('offlineQueuePush', object => {
        eventFired = true;
        should(object.query.body).be.eql(query.body);
      });

      kuzzle.query(queryArgs, query, cb);

      process.nextTick(() => {
        should(emitted).be.false();
        should(kuzzle.offlineQueue.length).be.exactly(1);
        should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
        should(kuzzle.offlineQueue[0].query).match(query);
        should(kuzzle.offlineQueue[0].cb).be.exactly(cb);
        should(eventFired).be.true();
        done();
      });
    });

    it('should queue the request if a queue filter has been defined and if it allows queuing', function (done) {
      var
        query = { body: { some: 'query'}},
        cb = function () {},
        now = Date.now(),
        eventFired = false;

      kuzzle.addListener('offlineQueuePush', object => {
        eventFired = true;
        should(object.query.body).be.eql(query.body);
      });

      kuzzle.state = 'offline';
      kuzzle.queueFilter = function () { return true; };
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, query, cb);

      process.nextTick(() => {
        should(emitted).be.false();
        should(kuzzle.offlineQueue.length).be.exactly(1);
        should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
        should(kuzzle.offlineQueue[0].query).match(query);
        should(kuzzle.offlineQueue[0].cb).be.exactly(cb);
        should(eventFired).be.true();
        done();
      });
    });

    it('should discard the request if a queue filter has been defined and if it does not allows queuing', function (done) {
      var
        query = { body: { some: 'query'}},
        cb = function () {},
        eventFired = false;

      kuzzle.addListener('offlineQueuePush', () => {
        eventFired = true;
      });
      kuzzle.state = 'offline';
      kuzzle.queueFilter = function () { return false; };
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, query, cb);

      process.nextTick(() => {
        should(emitted).be.false();
        should(kuzzle.offlineQueue.length).be.exactly(0);
        should(eventFired).be.false();
        done();
      });
    });

    it('should discard the request if in offline mode but queuing has not yet been activated', function (done) {
      var
        query = { body: { some: 'query'}},
        cb = function () {},
        eventFired = false;

      kuzzle.addListener('offlineQueuePush', () => {
        eventFired = true;
      });
      kuzzle.state = 'offline';
      kuzzle.queuing = false;
      kuzzle.query(queryArgs, query, cb);

      process.nextTick(() => {
        should(emitted).be.false();
        should(kuzzle.offlineQueue.length).be.exactly(0);
        should(eventFired).be.false();
        done();
      });
    });

    it('should not set jwtToken if we execute auth/checkToken', function () {
      this.timeout(200);

      Kuzzle = rewire(kuzzleSource);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.queuing = true;
      kuzzle.jwtToken = 'fake-token';

      kuzzle.query({collection: 'collection', controller: 'auth', action: 'checkToken', index: 'index'}, {});

      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].query.headers).be.undefined();
    });
  });

  describe('#cleanHistory', function () {
    it('should be started by kuzzle constructor', function () {
      var
        cleanStub = sinon.stub(),
        K = rewire(kuzzleSource);

      K.__set__('cleanHistory', cleanStub);
      new K('foo', {connect: 'manual'});

      should(cleanStub.calledOnce).be.true();
    });

    it('should clean oldest entries every 1s', function () {
      var
        i,
        clock = sinon.useFakeTimers(),
        kuzzle = new Kuzzle('foo', {connect: 'manual'});

      for (i = 100000; i >= 0; i -= 10000) {
        kuzzle.requestHistory[i] = -i;
      }

      clock.tick(1000);

      // should only contains i == 0 entry
      should(Object.keys(kuzzle.requestHistory)).match(['0']);

      kuzzle.requestHistory.foobar = -100000;

      clock.tick(1000);
      should(Object.keys(kuzzle.requestHistory)).match(['0']);

      clock.restore();
    });
  });
});
