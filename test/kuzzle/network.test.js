const
  should = require('should'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle network methods', () => {
  let kuzzle;

  beforeEach(() => {
    const network = new NetworkWrapperMock({host: 'somewhere'});

    network.close = sinon.stub();
    kuzzle = new Kuzzle(network);
  });

  describe('#disconnect', () => {
    it('should close network connection', () => {
      kuzzle.disconnect();
      should(kuzzle.network.close).be.calledOnce();
    });
  });

  describe('#events', () => {
    it('should propagate network "queryError" events', () => {
      const
        eventStub = sinon.stub(),
        error = {message: 'foo-bar'},
        query = {foo: 'bar'};

      kuzzle.addListener('queryError', eventStub);
      kuzzle.network.emit('queryError', error, query);

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({message: 'foo-bar'}, {foo: 'bar'});
    });

    it('should propagate network "tokenExpired" events', () => {
      const eventStub = sinon.stub();

      kuzzle.addListener('tokenExpired', eventStub);
      kuzzle.network.emit('tokenExpired');

      should(eventStub).be.calledOnce();
    });

    it('should empty the jwt when a "tokenExpired" events is triggered', () => {
      kuzzle.jwt = 'foobar';
      kuzzle.network.emit('tokenExpired');

      should(kuzzle.jwt).be.undefined();
    });
  });
});
