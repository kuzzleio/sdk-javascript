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

  it('should start queuing when connecting if autoQueue is set', () => {
    const kuzzle = new Kuzzle(networks.somewhere);
    kuzzle.network.isReady.returns(false);

    kuzzle.autoQueue = true;
    kuzzle.startQueuing = sinon.stub();

    return kuzzle.connect()
      .then(() => {
        should(kuzzle.startQueuing)
          .be.calledOnce();
      });
  });

  describe('=> Connection Events', () => {
    it('should register listeners upon receiving a "error" event', () => {
      const
        kuzzle = new Kuzzle(networks.nowhere),
        eventStub = sinon.stub();

      kuzzle.addListener('networkError', eventStub);

      return kuzzle.connect()
        .catch(() => should(eventStub).be.calledOnce());
    });

    it('should register listeners upon receiving a "connect" event', () => {
      const
        kuzzle = new Kuzzle(networks.somewhere),
        eventStub = sinon.stub();

      kuzzle.addListener('connected', eventStub);

      return kuzzle.connect()
        .then(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should register listeners upon receiving a "reconnect" event', () => {
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

    it('should stop queuing once connected if autoQueue option is set', () => {
      const
        kuzzle = new Kuzzle(networks.somewhere);

      kuzzle.autoQueue = true;
      kuzzle.stopQueuing = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.stopQueuing)
            .be.calledOnce();
        });
    });

    it('should not stop queuing once connected if autoQueue option is not set', () => {
      const
        kuzzle = new Kuzzle(networks.somewhere);

      kuzzle.autoQueue = false;
      kuzzle.stopQueuing = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.stopQueuing)
            .not.be.called();
        });
    });

    it('should play the queue once connected is autoReplay is set', () => {
      const
        kuzzle = new Kuzzle(networks.somewhere);

      kuzzle.autoReplay = true;
      kuzzle.playQueue = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.playQueue)
            .be.calledOnce();
        });
    });

    it('should not replay the queue once connected if autoReplay is not set', () => {
      const
        kuzzle = new Kuzzle(networks.somewhere);

      kuzzle.autoQueue = true;
      kuzzle.autoReplay = false;
      kuzzle.stopQueuing = sinon.stub();
      kuzzle.playQueue = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          // already called by the mock
          //kuzzle.network.emit('connect');

          should(kuzzle.stopQueuing)
            .be.calledOnce();
          should(kuzzle.playQueue)
            .not.be.called();
        });
    });

    it('should start queuing on error if autoQueue is set', () => {
      const
        kuzzle = new Kuzzle(networks.nowhere);

      kuzzle.autoQueue = true;
      kuzzle.startQueuing = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          throw new Error('no error');
        })
        .catch(() => {
          should(kuzzle.startQueuing)
            .be.calledTwice(); // once on connect ant the second time on error
        });
    });

    it('should not start queuing on error is autoQueue is not set', () => {
      const
        kuzzle = new Kuzzle(networks.nowhere);

      kuzzle.autoQueue = false;
      kuzzle.startQueuing = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          throw new Error('no error');
        })
        .catch(() => {
          should(kuzzle.startQueuing)
            .not.be.called();
        });
    });

    it('should stop queuing once reconnected if autoQueue is set', () => {
      const
        kuzzle = new Kuzzle(networks.somewhereagain);

      kuzzle.autoQueue = true;
      kuzzle.stopQueuing = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.stopQueuing)
            .be.calledOnce();
        });
    });

    it('should not stop queuing once reconnected if autoQueue is not set', () => {
      const
        kuzzle = new Kuzzle(networks.somewhereagain);

      kuzzle.autoQueue = false;
      kuzzle.stopQueuing = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.stopQueuing)
            .not.be.called();
        });
    });

    it('should play the queue once reconnected if autoReplay is set', () => {
      const
        kuzzle = new Kuzzle(networks.somewhereagain);

      kuzzle.autoReplay = true;
      kuzzle.playQueue = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.playQueue)
            .be.calledOnce();
        });
    });

    it('should not play the queue once reconnected if autoReplay is not set', () => {
      const
        kuzzle = new Kuzzle(networks.somewhereagain);

      kuzzle.autoReplay = false;
      kuzzle.playQueue = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.playQueue)
            .not.be.called();
        });
    });

  });
});
