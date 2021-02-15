const should = require('should');
const sinon = require('sinon');
const ProtocolMock = require('../mocks/protocol.mock');
const generateJwt = require('../mocks/generateJwt.mock');
const { Kuzzle } = require('../../src/Kuzzle');

describe('Kuzzle protocol methods', () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock('somewhere');

    protocol.close = sinon.stub();
    kuzzle = new Kuzzle(protocol);
  });

  describe('#disconnect', () => {
    it('should close protocol connection', () => {
      kuzzle.disconnect();

      should(kuzzle.protocol.close).be.calledOnce();
    });
  });

  describe('#events', () => {
    it('should propagate protocol "queryError" events', () => {
      const eventStub = sinon.stub();
      const error = { message: 'foo-bar' };
      const request = { foo: 'bar' };

      kuzzle.connect();
      kuzzle.addListener('queryError', eventStub);

      kuzzle.protocol.emit('queryError', { error, request });

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({
        error: { message: 'foo-bar' },
        request: { foo: 'bar'}
      });
    });

    it('should propagate protocol "tokenExpired" events', () => {
      const eventStub = sinon.stub();
      kuzzle.connect();
      kuzzle.addListener('tokenExpired', eventStub);

      kuzzle.protocol.emit('tokenExpired');

      should(eventStub).be.calledOnce();
    });

    it('should empty the jwt when a "tokenExpired" events is triggered', () => {
      kuzzle.jwt = generateJwt();
      kuzzle.connect();

      kuzzle.protocol.emit('tokenExpired');

      should(kuzzle.jwt).be.null();
    });
  });
});
