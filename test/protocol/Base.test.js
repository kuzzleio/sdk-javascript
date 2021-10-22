const should = require('should');
const sinon = require('sinon');

const { KuzzleError } = require('../../src/KuzzleError');
const { KuzzleAbstractProtocol } = require('../../src/protocols/abstract/Base');
const { PendingRequest } = require('../../src/protocols/abstract/PendingRequest');

describe('Common Protocol', () => {
  let
    sendSpy,
    protocol;

  beforeEach(function () {
    protocol = new KuzzleAbstractProtocol('somewhere');
    protocol.send = function(request) {
      protocol.emit(request.requestId, request.response);
    };
    sendSpy = sinon.spy(protocol, 'send');
  });

  describe('#constructor', () => {
    it('should accept string as port', () => {
      protocol = new KuzzleAbstractProtocol('somewhere', { port: '443' });

      should(protocol.port).be.eql(443);
    });

    it('should use ssl option if available and fallback to sslConnection option', () => {
      protocol = new KuzzleAbstractProtocol('somewhere', { ssl: true });

      should(protocol.ssl).be.true();

      protocol = new KuzzleAbstractProtocol('somewhere', { sslConnection: true });

      should(protocol.ssl).be.true();
    });

    it('should use ssl connection when port is 443 or 7443 and option is not defined', () => {
      protocol = new KuzzleAbstractProtocol('somewhere', { port: 443 });

      should(protocol.ssl).be.true();

      protocol = new KuzzleAbstractProtocol('somewhere', { port: 7443 });

      should(protocol.ssl).be.true();

      protocol = new KuzzleAbstractProtocol('somewhere', { port: 4242 });

      should(protocol.ssl).be.false();
    });

    it('should use 7512 when no port is given or when port is not a parseable number', () => {
      protocol = new KuzzleAbstractProtocol('somewhere', { port: 'foobar' });

      should(protocol.port).be.eql(7512);

      protocol = new KuzzleAbstractProtocol('somewhere');

      should(protocol.port).be.eql(7512);
    });

    it('should accept number as port', () => {
      protocol = new KuzzleAbstractProtocol('somewhere', { port: 443 });

      should(protocol.port).be.eql(443);
    });
  });

  describe('#connected', () => {
    it('should return true if the protocol state is "connected"', () => {
      protocol.state = 'connected';

      should(protocol.connected).be.True();

      protocol.state = 'disconnected';

      should(protocol.connected).be.False();
    });
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

    it('should add the requests to pending requests', () => {
      protocol.send = () => {};
      const request = {requestId: 'bar', response: {}};

      protocol.query(request);

      const pending = protocol.pendingRequests.get('bar');

      should(pending).be.instanceOf(PendingRequest).and.match({request});
    });

    it('should fire a "queryError" event and reject if an error occurred', () => {
      const eventStub = sinon.stub();
      const response = {
        error: {
          message: 'foo-bar'
        }
      };

      protocol.addListener('queryError', eventStub);

      return protocol.query({requestId: 'foobar', response: response})
        .then(() => Promise.reject(new Error('message')))
        .catch(err => {
          should(eventStub).be.calledOnce();
          should(err).be.eql(response.error);
          should(err.message).be.exactly('foo-bar');
        });
    });

    it('should trigger a "tokenExpired" event if the token has expired', () => {
      const
        eventStub = sinon.stub(),
        response = {
          error: {
            id: 'security.token.invalid'
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
          should(protocol.pendingRequests.has('bar')).be.false();
        });
    });

    it('should throw a KuzzleError on error', () => {
      const response = {
        error: {
          message: 'foo-bar',
          status: 442,
          stack: 'you are the bug',
          id: 'api.foo.bar'
        }
      };

      return protocol.query({ requestId: 'foobar', response: response })
        .then(() => Promise.reject({message: 'No error'}))
        .catch(error => {
          should(error).be.instanceOf(KuzzleError);
          should(error.message).be.eql('foo-bar');
          should(error.status).be.eql(442);
          should(error.stack).match(/you are the bug/);
          should(error.stack).match(/KuzzleAbstractProtocol/);
          should(error.stack).match(/>\s{4}at Context.<anonymous>/);
        });
    });

    it('should reject an error with more context', () => {
      const response = {
        error: {
          status: 404,
          id: 'api.process.action_not_found',
          code: 33685509,
          kuzzleStack: 'NotFoundError: API action "foo":"bar" not found',
          message: 'API action "foo":"bar" not found',
          stack: 'NotFoundError: API action "foo":"bar" not found',
        }
      };
      const request = {
        requestId: 'foobar',
        controller: 'foo',
        action: 'bar',
        index: 'test',
        volatile: new Object(),
        collection: 'toto',
        response: response,
      };

      return protocol.query(request)
        .then(() => Promise.reject({ message: 'No error' }))
        .catch(error => {
          should(error).be.instanceOf(KuzzleError);
          should(error.message).be.equal('API action "foo":"bar" not found');
          should(error.status).be.equal(404);
          should(error.id).be.equal('api.process.action_not_found');
          should(error.code).be.equal(33685509);
          should(error.kuzzleStack).be.equal('NotFoundError: API action "foo":"bar" not found');
          should(error.controller).be.equal('foo');
          should(error.action).be.equal('bar');
          should(error.volatile).be.a.Object();
          should(error.index).be.equal('test');
          should(error.collection).be.equal('toto');
          should(error.requestId).be.equal('foobar');
          should(error.stack).match(/NotFoundError: API action "foo":"bar" not found/);
          should(error.stack).match(/KuzzleAbstractProtocol/);
          should(error.stack).match(/>\s{4}at Context.<anonymous>/);
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
          count: 42,
          id: 'api.foo.bar'
        }
      };

      return protocol.query({ requestId: 'foobar', response: response })
        .then(() => Promise.reject(new Error('message')))
        .catch(error => {
          should(error).be.instanceOf(KuzzleError);
          should(error.message).be.eql('foo-bar');
          should(error.status).be.eql(206);
          should(error.stack).match(/you are the bug/);
          should(error.stack).match(/KuzzleAbstractProtocol/);
          should(error.stack).match(/>\s{4}at Context.<anonymous>/);
          should(error.errors).be.an.Array();
          should(error.errors.length).eql(2);
          should(error.count).eql(42);
        });
    });
  });

  describe('#clear', () => {
    it('should discard and reject cleared requests', () => {
      const
        request1 = { requestId: '12345', body: 'foobar' },
        request2 = { requestId: '54321', body: 'barfoo' };

      protocol.state = 'ready';
      protocol.send = () => {};

      protocol.query(request1);
      protocol.query(request2);

      protocol.listenerCount(request1.requestId).should.be.eql(1);
      protocol.listenerCount(request2.requestId).should.be.eql(1);

      const
        pending1 = protocol._pendingRequests.get(request1.requestId),
        pending2 = protocol._pendingRequests.get(request2.requestId);

      const listener = sinon.stub();
      protocol.on('discarded', listener);

      protocol.clear();

      should(listener).be.calledTwice();
      should(listener.getCall(0).args).be.eql([request1]);
      should(listener.getCall(1).args).be.eql([request2]);

      should(protocol._pendingRequests).be.empty();

      protocol.listenerCount(request1.requestId).should.be.eql(0);
      protocol.listenerCount(request2.requestId).should.be.eql(0);

      return pending1.promise.should.be.rejectedWith({message: 'Network error: request was sent but no response has been received'})
        .then(() => pending2.promise.should.be.rejectedWith({message: 'Network error: request was sent but no response has been received'}));
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
