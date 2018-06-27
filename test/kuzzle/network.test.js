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

  describe('#flushQueue', () => {
    it('should return Kuzzle instance', () => {
      should(kuzzle.flushQueue()).be.exactly(kuzzle);
    });

    it('should call network flushQueue method', () => {
      kuzzle.flushQueue();
      should(kuzzle.network.flushQueue).be.calledOnce();
    });
  });

  describe('#playQueue', () => {
    it('should return Kuzzle instance', () => {
      should(kuzzle.playQueue()).be.exactly(kuzzle);
    });

    it('should call network playQueue method', () => {
      kuzzle.playQueue();
      should(kuzzle.network.playQueue).be.calledOnce();
    });
  });

  describe('#startQueuing', () => {
    it('should return Kuzzle instance', () => {
      should(kuzzle.startQueuing()).be.exactly(kuzzle);
    });

    it('should call network startQueuing method', () => {
      kuzzle.startQueuing();
      should(kuzzle.network.startQueuing).be.calledOnce();
    });
  });

  describe('#stopQueuing', () => {
    it('should return Kuzzle instance', () => {
      should(kuzzle.stopQueuing()).be.exactly(kuzzle);
    });

    it('should call network stopQueuing method', () => {
      kuzzle.stopQueuing();
      should(kuzzle.network.stopQueuing).be.calledOnce();
    });
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

    it('should propagate network "offlineQueuePush" events', () => {
      const eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePush', eventStub);
      kuzzle.network.emit('offlineQueuePush', {query: {foo: 'bar'}, cb: 'callback'});

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({query: {foo: 'bar'}, cb: 'callback'});
    });

    it('should propagate network "offlineQueuePop" events', () => {
      const eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePop', eventStub);
      kuzzle.network.emit('offlineQueuePop', {foo: 'bar'});

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({foo: 'bar'});
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
