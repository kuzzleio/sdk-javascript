const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle protocol methods', () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock({host: 'somewhere'});

    protocol.close = sinon.stub();
    kuzzle = new Kuzzle(protocol);
  });

  describe('#flushQueue', () => {
    it('should return Kuzzle instance', () => {
      should(kuzzle.flushQueue()).be.exactly(kuzzle);
    });

    it('should call protocol flushQueue method', () => {
      kuzzle.flushQueue();
      should(kuzzle.protocol.flushQueue).be.calledOnce();
    });
  });

  describe('#playQueue', () => {
    it('should return Kuzzle instance', () => {
      should(kuzzle.playQueue()).be.exactly(kuzzle);
    });

    it('should call protocol playQueue method', () => {
      kuzzle.playQueue();
      should(kuzzle.protocol.playQueue).be.calledOnce();
    });
  });

  describe('#startQueuing', () => {
    it('should return Kuzzle instance', () => {
      should(kuzzle.startQueuing()).be.exactly(kuzzle);
    });

    it('should call protocol startQueuing method', () => {
      kuzzle.startQueuing();
      should(kuzzle.protocol.startQueuing).be.calledOnce();
    });
  });

  describe('#stopQueuing', () => {
    it('should return Kuzzle instance', () => {
      should(kuzzle.stopQueuing()).be.exactly(kuzzle);
    });

    it('should call protocol stopQueuing method', () => {
      kuzzle.stopQueuing();
      should(kuzzle.protocol.stopQueuing).be.calledOnce();
    });
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

    it('should propagate protocol "offlineQueuePush" events', () => {
      const eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePush', eventStub);
      kuzzle.protocol.emit('offlineQueuePush', {query: {foo: 'bar'}, cb: 'callback'});

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({query: {foo: 'bar'}, cb: 'callback'});
    });

    it('should propagate protocol "offlineQueuePop" events', () => {
      const eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePop', eventStub);
      kuzzle.protocol.emit('offlineQueuePop', {foo: 'bar'});

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({foo: 'bar'});
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
