var
  should = require('should'),
  sinon = require('sinon'),
  rewire = require('rewire'),
  RTWrapper = rewire('../../src/networkWrapper/wrappers/abstract/realtime');

describe('Network query management', function () {
  describe('#emitRequest', function () {
    var
      emitRequest = RTWrapper.__get__('emitRequest'),
      sendSpy,
      network;

    beforeEach(function () {
      network = new RTWrapper('somewhere', {connect: 'manual'});
      network.send = function(request) {
        network.emitEvent(request.requestId, request.response);
      };
      sendSpy = sinon.spy(network, 'send');
    });

    it('should emit the request when asked to', function () {
      var request = {requestId: 'bar'};

      emitRequest.call(network, request);
      should(sendSpy).be.calledWith(request);
    });

    it('should trigger an "emitRequest" event if the request has been emitted', function (done) {
      var eventStub = sinon.stub();

      network.addListener('emitRequest', eventStub);

      emitRequest.call(network, {requestId: 'foo', response: 'bar'}, function() {
        should(eventStub).be.calledOnce();
        done();
      });
    });

    it('should trigger a "tokenExpired" event if the token has expired', function (done) {
      var
        eventStub = sinon.stub(),
        response = {
          error: {
            message: 'Token expired'
          }
        };

      network.addListener('tokenExpired', eventStub);

      emitRequest.call(network, {requestId: 'foobar', response: response}, function(error) {
        should(eventStub).be.calledOnce();
        should(error.message).be.exactly('Token expired');
        done();
      });
    });

    it('should fire a queryError if an error occurred', function (done) {
      var
        eventStub = sinon.stub(),
        response = {
          error: {
            message: 'foo-bar'
          }
        };

      network.addListener('queryError', eventStub);

      emitRequest.call(network, {requestId: 'bar', response: response}, function(error) {
        should(eventStub).be.calledOnce();
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

      emitRequest.call(network, request, cb);
    });
  });

  describe('#query', function () {
    var
      emitRequestRevert,
      emitRequestStub,
      queryBody = {
        controller: 'controller',
        action: 'action',
        collection: 'collection',
        index: 'index',
        body: {some: 'query'}
      };

    before(function () {
      emitRequestStub = sinon.stub();
      emitRequestRevert = RTWrapper.__set__('emitRequest', emitRequestStub);
    });

    after(function () {
      emitRequestRevert();
    });

    beforeEach(function () {
      network = new RTWrapper('somewhere', {connect: 'manual'});
      network.state = 'connected';
      emitRequestStub.reset();
    });

    it('should exit early if the query is not queuable and the SDK is offline', function () {
      network.state = 'offline';
      network.query(queryBody, {queuable: false});
      should(emitRequestStub).not.be.called();
    });

    it('should emit the request directly without waiting the end of dequeuing if queuable is false', function () {
      network.state = 'connected';
      network.query(queryBody, {queuable: false});
      should(emitRequestStub).be.calledOnce();
    });

    it('should queue the request during offline mode, if queuing has been activated', function () {
      var
        now = Date.now(),
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.state = 'offline';
      network.queuing = true;

      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(network.offlineQueue[0].query).match(queryBody);
      should(network.offlineQueue[0].cb).be.exactly(cb);
      should(queueStub).be.calledOnce();
    });

    it('should discard the request during offline mode if queuing is deactivated', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.state = 'offline';
      network.queuing = false;

      network.query(queryBody, {queuable: true}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue).be.empty();
      should(queueStub).not.be.called();
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.instanceof(Error);
      should(cb.firstCall.args[0].message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
    });

    it('should discard the request if state is "connecting" and if queuing is deactivated', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.state = 'connecting';
      network.queuing = false;

      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue).be.empty();
      should(queueStub).not.be.called();
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.instanceof(Error);
      should(cb.firstCall.args[0].message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
    });

    it('should discard the request if not connected and if queuing is deactivated', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.state = 'offline';
      network.queuing = false;

      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue).be.empty();
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

      network.addListener('offlineQueuePush', queueStub);
      network.state = 'offline';
      network.queuing = true;
      network.queueFilter = function () { return true; };

      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(network.offlineQueue[0].query).match(queryBody);
      should(network.offlineQueue[0].cb).be.exactly(cb);
      should(queueStub).be.calledOnce();
    });

    it('should discard the request if a queue filter has been defined and if it does not allows queuing', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.state = 'offline';
      network.queuing = true;
      network.queueFilter = function () { return false; };

      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue).be.empty();
      should(queueStub).not.be.called();
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.instanceof(Error);
      should(cb.firstCall.args[0].message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
    });
  });
});
