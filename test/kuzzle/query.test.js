var
  should = require('should'),
  sinon = require('sinon'),
  rewire = require('rewire'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Query management', function () {
  describe('#emitRequest', function () {
    var
      emitRequest = Kuzzle.__get__('emitRequest'),
      kuzzle;

    beforeEach(function () {
      kuzzle = new Kuzzle('somewhere', {connect: 'manual'});
      kuzzle.network = new NetworkWrapperMock('somewhere');
    });

    it('should emit the request when asked to', function () {
      var
        request = {requestId: 'bar'},
        spy = sinon.spy(kuzzle.network, 'send');

      emitRequest.call(kuzzle, request);
      should(spy).be.calledWithMatch(request);
    });

    it('should trigger a tokenExpired event if the token has expired', function (done) {
      var
        tokenExpiredStub = sinon.stub(),
        response = {
          error: {
            message: 'Token expired'
          }
        };

      kuzzle.addListener('tokenExpired', tokenExpiredStub);

      emitRequest.call(kuzzle, {requestId: 'foobar', response: response}, function(error) {
        should(tokenExpiredStub).be.calledOnce();
        should(error.message).be.exactly('Token expired');
        done();
      });
    });

    it('should fire a queryError if an error occurred', function (done) {
      var
        queryErrorStub = sinon.stub(),
        response = {
          error: {
            message: 'foo-bar'
          }
        };

      kuzzle.addListener('queryError', queryErrorStub);

      emitRequest.call(kuzzle, {requestId: 'bar', response: response}, function(error) {
        should(queryErrorStub).be.calledOnce();
        should(error.message).be.exactly('foo-bar');
        done();
      });
    });

    it('should launch the callback once a response has been received', function (done) {
      var
        response = {result: 'foo', error: {foo: 'bar', message: 'foobar'}, status: 42},
        request = {requestId: 'someEvent', response: response},
        cb = function (err, res) {
          should(err).be.instanceOf(Error);
          should(err.message).be.exactly(response.error.message);
          should(err.stack).be.a.String();
          should(err.foo).be.exactly('bar');
          should(err.status).be.exactly(42);
          should(res).be.exactly(response);
          done();
        };

      emitRequest.call(kuzzle, request, cb);
    });
  });

  describe('#query', function () {
    var
      emitRequestRevert,
      emitRequestStub,
      queryBody = {body: {some: 'query'}},
      queryArgs = {
        controller: 'controller',
        action: 'action',
        collection: 'collection',
        index: 'index'
      },
      kuzzle;

    before(function () {
      emitRequestStub = sinon.stub();
      emitRequestRevert = Kuzzle.__set__('emitRequest', emitRequestStub);
    });

    after(function () {
      emitRequestRevert();
    });

    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {connect: 'manual'});
      kuzzle.state = 'connected';
      emitRequestStub.reset();
    });

    it('should throw an error if the kuzzle instance has been invalidated', function () {
      kuzzle.state = 'disconnected';
      should(function () { kuzzle.query(queryArgs, queryBody); }).throw(Error);
    });

    it('should generate a valid request object', function () {
      kuzzle.query(queryArgs, queryBody);
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWith({
        action: 'action',
        body: { some: 'query' },
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: { sdkInstanceId: kuzzle.id, sdkVersion: kuzzle.sdkVersion },
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should manage arguments properly if no options are provided', function () {
      var cb = sinon.stub();

      kuzzle.query(queryArgs, queryBody, cb);
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWith({
        action: 'action',
        body: { some: 'query' },
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: { sdkInstanceId: kuzzle.id, sdkVersion: kuzzle.sdkVersion },
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      }, sinon.match(function(f) {return f === cb;}));
    });

    it('should not define optional members if none was provided', function () {
      kuzzle.query({controller: 'foo', action: 'bar'}, queryBody);
      should(emitRequestStub).be.calledWithMatch({collection: undefined});
      should(emitRequestStub).be.calledWithMatch({index: undefined});
    });

    it('should invoke the callback with an error if no query is provided', function () {
      should(function () { kuzzle.query(queryArgs, sinon.stub()); }).throw(Error);
      should(function () { kuzzle.query(queryArgs, ['foo', 'bar']); }).throw(Error);
      should(function () { kuzzle.query(queryArgs); }).throw(Error);
      should(function () { kuzzle.query(queryArgs, 'foobar'); }).throw(Error);
    });

    it('should handle options volatile properly', function () {
      var
        volatile = {
          foo: 'bar',
          baz: ['foo', 'bar', 'qux']
        };

      kuzzle.query(queryArgs, queryBody, {volatile: volatile});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({volatile: volatile});
    });

    it('should copy query local volatile over optional ones', function () {
      var
        volatile = {
          foo: 'bar',
          baz: ['foo', 'bar', 'qux']
        };

      kuzzle.query(queryArgs, { body: { some: 'query'}, volatile: {foo: 'foo'}}, {volatile: volatile});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({volatile: {foo: 'foo', baz: volatile.baz}});
    });

    it('should handle option refresh properly', function () {
      kuzzle.query(queryArgs, queryBody, {refresh: 'foo'});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({refresh: 'foo'});
    });

    it('should handle option size properly', function () {
      kuzzle.query(queryArgs, queryBody, {size: 'foo'});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({size: 'foo'});
    });

    it('should handle option from properly', function () {
      kuzzle.query(queryArgs, queryBody, {from: 'foo'});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({from: 'foo'});
    });

    it('should handle option scroll properly', function () {
      kuzzle.query(queryArgs, queryBody, {scroll: 'foo'});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({scroll: 'foo'});
    });

    it('should handle option scrollId properly', function () {
      kuzzle.query(queryArgs, queryBody, {scrollId: 'foo'});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({scrollId: 'foo'});
    });

    it('should add global headers without overwriting any existing query headers', function () {
      kuzzle.headers = { foo: 'bar', bar: 'foo' };
      kuzzle.query(queryArgs, { foo: 'foo', body: {some: 'query'}});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({foo: 'foo', bar: 'foo'});
    });

    it('should not generate a new request ID if one is already defined', function () {
      kuzzle.query(queryArgs, { body: { some: 'query'}, requestId: 'foobar'});
      should(emitRequestStub).be.calledOnce();
      should(emitRequestStub).be.calledWithMatch({requestId: 'foobar'});
    });

    it('should exit early if the query is not queuable and the SDK is offline', function () {
      kuzzle.state = 'offline';
      kuzzle.query(queryArgs, queryBody, {queuable: false});
      should(emitRequestStub).not.be.called();
    });

    it('should emit the request directly without waiting the end of dequeuing if queuable is false', function () {
      kuzzle.state = 'offline';
      kuzzle.query(queryArgs, queryBody, {queuable: false});
      should(emitRequestStub).not.be.called();
    });

    it('should queue the request during offline mode, if queuing has been activated', function () {
      var
        now = Date.now(),
        queueStub = sinon.stub(),
        cb = sinon.stub();

      kuzzle.addListener('offlineQueuePush', queueStub);
      kuzzle.state = 'offline';
      kuzzle.queuing = true;

      kuzzle.query(queryArgs, queryBody, cb);

      should(emitRequestStub).not.be.called();
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(kuzzle.offlineQueue[0].query).match(queryBody);
      should(kuzzle.offlineQueue[0].cb).be.exactly(cb);
      should(queueStub).be.calledOnce();
    });

    it('should queue the request during offline mode, if queuable is set to true', function () {
      var
        now = Date.now(),
        queueStub = sinon.stub(),
        cb = sinon.stub();

      kuzzle.addListener('offlineQueuePush', queueStub);
      kuzzle.state = 'offline';
      kuzzle.queuing = false;

      kuzzle.query(queryArgs, queryBody, {queuable: true}, cb);

      should(emitRequestStub).not.be.called();
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(kuzzle.offlineQueue[0].query).match(queryBody);
      should(kuzzle.offlineQueue[0].cb).be.exactly(cb);
      should(queueStub).be.calledOnce();
    });

    it('should queue the request if state is connecting even if queuing is deactivated', function () {
      var
        now = Date.now(),
        queueStub = sinon.stub(),
        cb = sinon.stub();

      kuzzle.addListener('offlineQueuePush', queueStub);
      kuzzle.state = 'connecting';
      kuzzle.queuing = false;

      kuzzle.query(queryArgs, queryBody, cb);

      should(emitRequestStub).not.be.called();
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(kuzzle.offlineQueue[0].query).match(queryBody);
      should(kuzzle.offlineQueue[0].cb).be.exactly(cb);
      should(queueStub).be.calledOnce();
    });

    it('should discard the request if not connected and if queuing is deactivated', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      kuzzle.addListener('offlineQueuePush', queueStub);
      kuzzle.state = 'offline';
      kuzzle.queuing = false;

      kuzzle.query(queryArgs, queryBody, cb);

      should(emitRequestStub).not.be.called();
      should(kuzzle.offlineQueue).be.empty();
      should(queueStub).not.be.called();
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.instanceof(Error);
      should(cb.firstCall.args[0].message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
    });

    it('should queue the request if a queue filter has been defined and if it allows queuing', function () {
      var
        now = Date.now(),
        queueStub = sinon.stub(),
        cb = sinon.stub();

      kuzzle.addListener('offlineQueuePush', queueStub);
      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.queueFilter = function () { return true; };

      kuzzle.query(queryArgs, queryBody, cb);

      should(emitRequestStub).not.be.called();
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(kuzzle.offlineQueue[0].query).match(queryBody);
      should(kuzzle.offlineQueue[0].cb).be.exactly(cb);
      should(queueStub).be.calledOnce();
    });

    it('should discard the request if a queue filter has been defined and if it does not allows queuing', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      kuzzle.addListener('offlineQueuePush', queueStub);
      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.queueFilter = function () { return false; };

      kuzzle.query(queryArgs, queryBody, cb);

      should(emitRequestStub).not.be.called();
      should(kuzzle.offlineQueue).be.empty();
      should(queueStub).not.be.called();
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.instanceof(Error);
      should(cb.firstCall.args[0].message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
    });

    it('should set jwtToken except for auth/checkToken', function () {
      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.jwtToken = 'fake-token';

      kuzzle.query({controller: 'foo', action: 'bar'}, {});
      kuzzle.query({controller: 'auth', action: 'checkToken'}, {});

      should(kuzzle.offlineQueue.length).be.exactly(2);
      should(kuzzle.offlineQueue[0].query).match({
        controller: 'foo',
        action: 'bar',
        jwt: 'fake-token'
      });
      should(kuzzle.offlineQueue[0].query.jwt).be.equal('fake-token');
      should(kuzzle.offlineQueue[1].query).match({
        controller: 'auth',
        action: 'checkToken'
      });
      should(kuzzle.offlineQueue[1].query.jwt).be.undefined();
    });
  });
});
