var
  should = require('should'),
  sinon = require('sinon'),
  AbstractWrapper = require('../../src/networkWrapper/protocols/abstract/common');

describe('Network query management', () => {
  describe('#query', () => {
    let
      network;

    beforeEach(function () {
      network = new AbstractWrapper('somewhere');
      network.send = function(request) {
        network.emit(request.requestId, request.response);
      };
      sendSpy = sinon.spy(network, 'send');
    });

  });

  describe('#query', () => {
    let
      sendSpy,
      network;

    beforeEach(() => {
      network = new AbstractWrapper('somewhere');
      network.isReady = sinon.stub().returns(true);
      network.send = function(request) {
        network.emit(request.requestId, request.response);
      };
      sendSpy = sinon.spy(network, 'send');
      network._emitRequest = sinon.stub().resolves();
    });

    it('should reject if not ready', () => {
      network.isReady.returns(false);

      return network.query({controller: 'foo', action: 'bar'})
        .then(() => {
          throw new Error('no error');
        })
        .catch(error => {
          should(error.message).startWith('Unable to execute request: not connected to a Kuzzle server.');
        });
    });

    it('should emit the request when asked to', () => {
      const request = {requestId: 'bar', response: {}};

      network.query(request);
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

      network.addListener('queryError', eventStub);

      return network.query({requestId: 'foobar', response: response})
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

      return network.query({requestId: 'foobar', response: response})
        .then(() => Promise.reject({message: 'No error'}))
        .catch(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should resolve the promise once a response has been received', () => {
      const
        response = {result: 'foo', error: null, status: 42},
        request = {requestId: 'someEvent', response: response};

      return network.query(request)
        .then(res => {
          should(res.error).be.null();
          should(res.result).be.exactly(response.result);
          should(res.status).be.exactly(42);
        });
    });
  });
});
