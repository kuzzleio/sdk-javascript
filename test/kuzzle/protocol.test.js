const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  Kuzzle = require('../../src/Kuzzle');

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
      const
        eventStub = sinon.stub(),
        error = {message: 'foo-bar'},
        query = {foo: 'bar'};

      kuzzle.addListener('queryError', eventStub);
      kuzzle.protocol.emit('queryError', error, query);

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({message: 'foo-bar'}, {foo: 'bar'});
    });

    it('should propagate protocol "tokenExpired" events', () => {
      const eventStub = sinon.stub();

      kuzzle.addListener('tokenExpired', eventStub);
      kuzzle.protocol.emit('tokenExpired');

      should(eventStub).be.calledOnce();
    });

    it('should empty the jwt when a "tokenExpired" events is triggered', () => {
      kuzzle.jwt = 'foobar';
      kuzzle.protocol.emit('tokenExpired');

      should(kuzzle.jwt).be.undefined();
    });
  });
});
