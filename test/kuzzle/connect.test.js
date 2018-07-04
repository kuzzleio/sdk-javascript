const
  should = require('should'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle connect', () => {

  const networks = {
    somewhere: new NetworkWrapperMock({host: 'somewhere'}),
    somewhereagain: new NetworkWrapperMock({host: 'somewhereagain'}),
    nowhere: new NetworkWrapperMock({host: 'nowhere'})
  };

  it('should return immediately if already connected', () => {
    const kuzzle = new Kuzzle(networks.somewhere);
    kuzzle.network.isReady.returns(true);

    return kuzzle.connect()
      .then(() => {
        should(kuzzle.network.connectCalled).be.false();
      });
  });

  it('should call network wrapper connect() method when the instance is offline', () => {
    const kuzzle = new Kuzzle(networks.somewhere);
    kuzzle.network.isReady.returns(false);

    return kuzzle.connect()
      .then(() => {
        should(kuzzle.network.connectCalled).be.true();
      });
  });

  describe('=> Connection Events', () => {
    it('should registered listeners upon receiving a "error" event', () => {
      const
        kuzzle = new Kuzzle(networks.nowhere),
        eventStub = sinon.stub();

      kuzzle.addListener('networkError', eventStub);

      return kuzzle.connect()
        .catch(() => should(eventStub).be.calledOnce());
    });

    it('should registered listeners upon receiving a "connect" event', () => {
      const
        kuzzle = new Kuzzle(networks.somewhere),
        eventStub = sinon.stub();

      kuzzle.addListener('connected', eventStub);

      return kuzzle.connect()
        .then(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should registered listeners upon receiving a "reconnect" event', () => {
      const
        kuzzle = new Kuzzle(networks.somewhereagain),
        eventStub = sinon.stub();

      kuzzle.addListener('reconnected', eventStub);

      return kuzzle.connect()
        .then(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should keep a valid JWT at reconnection', () => {
      const kuzzle = new Kuzzle(networks.somewhereagain);

      kuzzle.checkToken = sinon.stub();
      kuzzle.jwt = 'foobar';

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.checkToken).be.calledOnce();
          should(kuzzle.checkToken).be.calledWith('foobar');
          kuzzle.checkToken.yield(null, {valid: true});

          should(kuzzle.jwt).be.eql('foobar');
        });
    });

    it('should empty the JWT at reconnection if it has expired', () => {
      const kuzzle = new Kuzzle(networks.somewhereagain);

      kuzzle.checkToken = sinon.stub();
      kuzzle.jwt = 'foobar';

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.checkToken).be.calledOnce();
          should(kuzzle.checkToken).be.calledWith('foobar');
          kuzzle.checkToken.yield(null, {valid: false});

          should(kuzzle.jwt).be.undefined();
        });
    });

    it('should register listeners upon receiving a "disconnect" event', () => {
      const
        kuzzle = new Kuzzle(networks.somewhere),
        eventStub = sinon.stub();

      kuzzle.addListener('disconnected', eventStub);

      return kuzzle.connect()
        .then(() => kuzzle.network.disconnect())
        .then(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should register listeners upon receiving a "discarded" event', () => {
      const
        kuzzle = new Kuzzle(networks.somewhere),
        eventStub = sinon.stub();

      kuzzle.addListener('discarded', eventStub);

      return kuzzle.connect()
        .then(() => kuzzle.network.emit('discarded'))
        .then(() => {
          should(eventStub).be.calledOnce();
        });
    });
  });
});
