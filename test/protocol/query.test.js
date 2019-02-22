const
  should = require('should'),
  sinon = require('sinon'),
  KuzzleError = require('../../src/KuzzleError'),
  AbstractWrapper = require('../../src/protocols/abstract/common');

describe('Protocol query management', () => {
  describe('#query', () => {
    let
      protocol;

    beforeEach(function () {
      protocol = new AbstractWrapper('somewhere');
      protocol.send = function(request) {
        protocol.emit(request.requestId, request.response);
      };
      sendSpy = sinon.spy(protocol, 'send');
    });

  });

  describe('#query', () => {
    let
      sendSpy,
      protocol;

    beforeEach(() => {
      protocol = new AbstractWrapper('somewhere');
      protocol.isReady = sinon.stub().returns(true);
      protocol.send = function(request) {
        protocol.emit(request.requestId, request.response);
      };
      sendSpy = sinon.spy(protocol, 'send');
      protocol._emitRequest = sinon.stub().resolves();
    });

    it('should reject if not ready', () => {
      protocol.isReady.returns(false);

      return protocol.query({controller: 'foo', action: 'bar'})
        .then(() => {
          throw new Error('no error');
        })
        .catch(error => {
          should(error.message).startWith('Unable to execute request: not connected to a Kuzzle server.');
        });
    });

    it('should emit the request when asked to', () => {
      const request = {requestId: 'bar', response: {}};

      protocol.query(request);
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

      return protocol.query({requestId: 'foobar', response: response})
        .then(() => Promise.reject({message: 'No error'}))
        .catch(error => {
          should(eventStub).be.calledOnce();
          should(error).be.instanceOf(KuzzleError);
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

      return protocol.query({requestId: 'foobar', response: response})
        .then(() => Promise.reject({message: 'No error'}))
        .catch(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should resolve the promise once a response has been received', () => {
      const
        response = {result: 'foo', error: null, status: 42},
        request = {requestId: 'someEvent', response: response};

      return protocol.query(request)
        .then(res => {
          should(res.error).be.null();
          should(res.result).be.exactly(response.result);
          should(res.status).be.exactly(42);
        });
    });

    it('should throw a KuzzleError on error', () => {
      const response = {
        error: {
          message: 'foo-bar',
          status: 442,
          stack: 'you are the bug'
        }
      };

      return protocol.query({ requestId: 'foobar', response: response })
        .then(() => Promise.reject({message: 'No error'}))
        .catch(error => {
          should(error).be.instanceOf(KuzzleError);
          should(error.message).be.eql('foo-bar');
          should(error.status).be.eql(442);
          should(error.stack).be.eql('you are the bug');
        });
    });
  });
});
