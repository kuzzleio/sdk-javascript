var
  should = require('should'),
  sinon = require('sinon'),
  AbstractWrapper = require('../../src/protocols/abstract/common');

describe('Protocol query management', () => {
  describe('#emitRequest', () => {
    let
      sendSpy,
      protocol;

    beforeEach(function () {
      protocol = new AbstractWrapper('somewhere');
      protocol.send = function(request) {
        protocol.emit(request.requestId, request.response);
      };
      sendSpy = sinon.spy(protocol, 'send');
    });

    it('should emit the request when asked to', () => {
      const request = {requestId: 'bar', response: {}};

      protocol._emitRequest(request);
      should(sendSpy)
        .be.calledOnce()
        .be.calledWith(request);
    });

    it('should fire a "queryError" event and reject if an error occurred', () => {
      const
        eventStub = sinon.stub(),
        response = {
          error: {
            message: 'foo-bar'
          }
        };

      protocol.addListener('queryError', eventStub);

      return protocol._emitRequest({requestId: 'foobar', response: response})
        .then(() => Promise.reject({message: 'No error'}))
        .catch(error => {
          should(eventStub).be.calledOnce();
          should(error.message).be.exactly('foo-bar');
        });
    });

    it('should trigger a "tokenExpired" event if the token has expired', () => {
      const
        eventStub = sinon.stub(),
        response = {
          error: {
            message: 'Token expired'
          }
        };

      protocol.addListener('tokenExpired', eventStub);

      return protocol._emitRequest({requestId: 'foobar', response: response})
        .then(() => Promise.reject({message: 'No error'}))
        .catch(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should resolve the promise once a response has been received', () => {
      const
        response = {result: 'foo', error: null, status: 42},
        request = {requestId: 'someEvent', response: response};

      return protocol._emitRequest(request)
        .then(res => {
          should(res.error).be.null();
          should(res.result).be.exactly(response.result);
          should(res.status).be.exactly(42);
        });
    });
  });

  describe('#query', () => {
    const
      queryBody = {
        controller: 'controller',
        action: 'action',
        collection: 'collection',
        index: 'index',
        body: {some: 'query'}
      };


    beforeEach(() => {
      protocol = new AbstractWrapper('somewhere');
      protocol.isReady = sinon.stub().returns(true);
      protocol._emitRequest = sinon.stub().resolves();
    });

    it('should exit early if the query is not queuable and the SDK is offline', () => {
      protocol.isReady.returns(false);

      return protocol.query(queryBody, {queuable: false})
        .then(() => Promise.reject(new Error({message: 'No error'})))
        .catch(error => {
          should(error.message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
          should(protocol._emitRequest).not.be.called();
        });
    });

    it('should emit the request directly without waiting the end of dequeuing if queuable is false', () => {
      return protocol.query(queryBody, {queuable: false})
        .then(() => should(protocol._emitRequest).be.calledOnce());
    });

    it('should queue the request during offline mode, if queuing has been activated', () => {
      const now = Date.now();

      protocol.isReady.returns(false);
      protocol.queuing = true;

      const promise = protocol.query(queryBody, {});
      should(protocol._emitRequest).not.be.called();
      should(protocol.offlineQueue.length).be.exactly(1);
      should(protocol.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(protocol.offlineQueue[0].request).match(queryBody);

      protocol.offlineQueue[0].resolve('foobar');
      return should(promise).be.fulfilledWith('foobar')
        .then(() => {
          const rejected = protocol.query(queryBody, {});
          protocol.offlineQueue[1].reject(new Error('barfoo'));
          return should(rejected).be.rejectedWith('barfoo');
        });
    });

    it('should emit a "offlineQueuePush" event while queuing a query', () => {
      const queueStub = sinon.stub();

      protocol.addListener('offlineQueuePush', queueStub);
      protocol.isReady.returns(false);
      protocol.queuing = true;

      protocol.query(queryBody, {});

      should(queueStub)
        .be.calledOnce()
        .be.calledWith({request: queryBody});
    });

    it('should discard the request during offline mode if queuing is deactivated', () => {
      const queueStub = sinon.stub();

      protocol.isReady.returns(false);
      protocol.queuing = false;
      protocol.addListener('offlineQueuePush', queueStub);

      return protocol.query(queryBody, {queuable: true})
        .catch(err => {
          should(queueStub).not.be.called();
          should(protocol._emitRequest).not.be.called();
          should(protocol.offlineQueue).be.empty();
          should(err).be.instanceof(Error);
          should(err.message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
        });
    });

    it('should queue the request if a queue filter has been defined and if it allows queuing', () => {
      const
        now = Date.now(),
        queueStub = sinon.stub();

      protocol.addListener('offlineQueuePush', queueStub);
      protocol.isReady.returns(false);
      protocol.queuing = true;
      protocol.queueFilter = sinon.stub().returns(true);

      protocol.query(queryBody, {});

      should(protocol._emitRequest).not.be.called();
      should(protocol.offlineQueue.length).be.exactly(1);
      should(protocol.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(protocol.offlineQueue[0].request).match(queryBody);
      should(queueStub).be.calledOnce();
    });

    it('should discard the request if a queue filter has been defined and if it does not allows queuing', function () {
      const queueStub = sinon.stub();

      protocol.addListener('offlineQueuePush', queueStub);
      protocol.isReady.returns(false);
      protocol.queuing = true;
      protocol.queueFilter = sinon.stub().returns(false);

      return protocol.query(queryBody, {})
        .catch(err => {
          should(queueStub).not.be.called();
          should(protocol._emitRequest).not.be.called();
          should(protocol.offlineQueue).be.empty();
          should(err).be.instanceof(Error);
          should(err.message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
        });
    });
  });
});
