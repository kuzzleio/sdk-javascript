var
  should = require('should'),
  sinon = require('sinon'),
  AbstractWrapper = require('../../src/networkWrapper/protocols/abstract/common');

describe('Network query management', () => {
  describe('#emitRequest', () => {
    let
      sendSpy,
      network;

    beforeEach(function () {
      network = new AbstractWrapper('somewhere');
      network.send = function(request) {
        network.emit(request.requestId, request.response);
      };
      sendSpy = sinon.spy(network, 'send');
    });

    it('should emit the request when asked to', () => {
      const request = {requestId: 'bar', response: {}};

      network._emitRequest(request);
      should(sendSpy)
        .be.calledOnce()
        .be.calledWith(request);
    });

    it('should reject if an error occurs sending the request', () => {
      network.send = sinon.stub().rejects('Error sending request');

      const request = {foo: 'bar'};

      return network._emitRequest({foo: 'bar'})
        .then(() => Promise.reject('No error'))
        .catch(err => {
          should(network.send)
            .be.calledOnce()
            .be.calledWith(request);
          should(err).be.an.instanceof(Error);
          should(err.name).be.exactly('Error sending request');
        });
    });

    it('should fire a "queryError" event and reject if an error occurred', () => {
      const
        eventStub = sinon.stub(),
        response = {
          error: {
            message: 'foo-bar'
          }
        };

      network.addListener('queryError', eventStub);

      return network._emitRequest({requestId: 'foobar', response: response})
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

      network.addListener('tokenExpired', eventStub);

      return network._emitRequest({requestId: 'foobar', response: response})
        .then(() => Promise.reject({message: 'No error'}))
        .catch(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should resolve the promise once a response has been received', () => {
      const
        response = {result: 'foo', error: null, status: 42},
        request = {requestId: 'someEvent', response: response};

      return network._emitRequest(request)
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
      network = new AbstractWrapper('somewhere');
      network.isReady = sinon.stub().returns(true);
      network._emitRequest = sinon.stub().resolves();
    });

    it('should exit early if the query is not queuable and the SDK is offline', () => {
      network.isReady.returns(false);

      return network.query(queryBody, {queuable: false})
        .then(() => Promise.reject(new Error({message: 'No error'})))
        .catch(error => {
          should(error.message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
          should(network._emitRequest).not.be.called();
        });
    });

    it('should emit the request directly without waiting the end of dequeuing if queuable is false', () => {
      return network.query(queryBody, {queuable: false})
        .then(() => should(network._emitRequest).be.calledOnce());
    });

    it('should queue the request during offline mode, if queuing has been activated', () => {
      const now = Date.now();

      network.isReady.returns(false);
      network.queuing = true;

      const promise = network.query(queryBody, {});
      should(network._emitRequest).not.be.called();
      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(network.offlineQueue[0].request).match(queryBody);

      network.offlineQueue[0].resolve('foobar');
      return should(promise).be.fulfilledWith('foobar')
        .then(() => {
          const rejected = network.query(queryBody, {});
          network.offlineQueue[1].reject(new Error('barfoo'));
          return should(rejected).be.rejectedWith('barfoo');
        });
    });

    it('should emit a "offlineQueuePush" event while queuing a query', () => {
      const queueStub = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.isReady.returns(false);
      network.queuing = true;

      network.query(queryBody, {});

      should(queueStub)
        .be.calledOnce()
        .be.calledWith({request: queryBody});
    });

    it('should discard the request during offline mode if queuing is deactivated', () => {
      const queueStub = sinon.stub();

      network.isReady.returns(false);
      network.queuing = false;
      network.addListener('offlineQueuePush', queueStub);

      return network.query(queryBody, {queuable: true})
        .catch(err => {
          should(queueStub).not.be.called();
          should(network._emitRequest).not.be.called();
          should(network.offlineQueue).be.empty();
          should(err).be.instanceof(Error);
          should(err.message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
        });
    });

    it('should queue the request if a queue filter has been defined and if it allows queuing', () => {
      const
        now = Date.now(),
        queueStub = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.isReady.returns(false);
      network.queuing = true;
      network.queueFilter = sinon.stub().returns(true);

      network.query(queryBody, {});

      should(network._emitRequest).not.be.called();
      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(network.offlineQueue[0].request).match(queryBody);
      should(queueStub).be.calledOnce();
    });

    it('should discard the request if a queue filter has been defined and if it does not allows queuing', function () {
      const queueStub = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.isReady.returns(false);
      network.queuing = true;
      network.queueFilter = sinon.stub().returns(false);

      return network.query(queryBody, {})
        .catch(err => {
          should(queueStub).not.be.called();
          should(network._emitRequest).not.be.called();
          should(network.offlineQueue).be.empty();
          should(err).be.instanceof(Error);
          should(err.message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
        });
    });
  });
});
