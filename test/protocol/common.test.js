const
  should = require('should'),
  sinon = require('sinon'),
  KuzzleError = require('../../src/KuzzleError'),
  AbstractWrapper = require('../../src/protocols/abstract/common');

describe('Common Protocol', () => {
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

  describe('#query', () => {

    beforeEach(() => {
      protocol.isReady = sinon.stub().returns(true);
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

    it('should adds the requests to pending requests', () => {
      protocol.send = () => {};
      const request = {requestId: 'bar', response: {}};

      protocol.query(request);

      should(protocol.pendingRequests.get('bar')).be.eql(request);
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
          should(protocol.pendingRequests.get('bar')).be.undefined();
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

    it('should keep internal errors on PartialErrors', () => {
      const response = {
        error: {
          message: 'foo-bar',
          status: 206,
          stack: 'you are the bug',
          errors: [
            'some',
            'error'
          ],
          count: 42
        }
      };

      return protocol.query({ requestId: 'foobar', response: response })
        .then(() => Promise.reject({message: 'No error'}))
        .catch(error => {
          should(error).be.instanceOf(KuzzleError);
          should(error.message).be.eql('foo-bar');
          should(error.status).be.eql(206);
          should(error.stack).be.eql('you are the bug');
          should(error.errors).be.an.Array();
          should(error.errors.length).eql(2);
          should(error.count).eql(42);
        });
    });
  });

  describe('#clear', () => {
    it('should send "discarded" event for each pending request', () => {
      const
        request1 = { requestId: '12345', body: 'foobar' },
        request2 = { requestId: '54321', body: 'barfoo' };

      protocol._pendingRequests.set(request1, request1);
      protocol._pendingRequests.set(request2, request2);

      const listener = sinon.stub();
      protocol.on('discarded', listener);

      protocol.clear();

      should(listener).be.calledTwice();
      should(listener.getCall(0).args).be.eql([request1]);
      should(listener.getCall(1).args).be.eql([request2]);
    });
  });

  describe('#close', () => {
    it('should set state to "offline" and clear pending requests', () => {
      protocol.clear = sinon.stub();

      protocol.close();

      should(protocol.state).be.eql('offline');
      should(protocol.clear).be.calledOnce();
    });
  });
});
