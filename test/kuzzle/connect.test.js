const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  generateJwt = require('../mocks/generateJwt.mock'),
  { Kuzzle } = require('../../src/Kuzzle');

describe('Kuzzle connect', () => {

  const protocols = {
    somewhere: new ProtocolMock('somewhere'),
    somewhereagain: new ProtocolMock('somewhereagain'),
    nowhere: new ProtocolMock('nowhere')
  };

  it('should return immediately if already connected', () => {
    const kuzzle = new Kuzzle(protocols.somewhere);
    kuzzle.protocol.isReady.returns(true);

    return kuzzle.connect()
      .then(() => {
        should(kuzzle.protocol.connectCalled).be.false();
      });
  });

  it('should call protocol wrapper connect() method when the instance is offline', () => {
    const kuzzle = new Kuzzle(protocols.somewhere);
    kuzzle.protocol.isReady.returns(false);

    return kuzzle.connect()
      .then(() => {
        should(kuzzle.protocol.connectCalled).be.true();
      });
  });

  it('should start queuing when connecting if autoQueue is set', () => {
    const kuzzle = new Kuzzle(protocols.somewhere);
    kuzzle.protocol.isReady.returns(false);

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
        kuzzle = new Kuzzle(protocols.nowhere),
        eventStub = sinon.stub();

      kuzzle.realtime.disconnected = sinon.stub();

      kuzzle.addListener('networkError', eventStub);

      return kuzzle.connect()
        .then(() => {
          throw new Error('should not happen');
        })
        .catch(() => {
          should(kuzzle.realtime.disconnected).be.calledOnce();
          should(eventStub).be.calledOnce();
        });
    });

    it('should register listeners upon receiving a "connect" event', () => {
      const
        kuzzle = new Kuzzle(protocols.somewhere),
        eventStub = sinon.stub();

      kuzzle.addListener('connected', eventStub);

      return kuzzle.connect()
        .then(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should register listeners upon receiving a "reconnect" event', () => {
      const
        kuzzle = new Kuzzle(protocols.somewhereagain),
        eventStub = sinon.stub();

      kuzzle.realtime.reconnected = sinon.stub();

      kuzzle.addListener('reconnected', eventStub);

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.realtime.reconnected).be.calledOnce();
          should(eventStub).be.calledOnce();
        });
    });

    it('should keep a valid JWT at reconnection', () => {
      const
        jwt = generateJwt(),
        kuzzle = new Kuzzle(protocols.somewhereagain);

      kuzzle.auth.checkToken = sinon.stub().resolves({
        valid: true
      });
      kuzzle.jwt = jwt;

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.auth.checkToken).be.calledOnce();

          should(kuzzle.jwt).be.eql(jwt);
        });
    });

    it('should empty the JWT at reconnection if it has expired', () => {
      const
        jwt = generateJwt(),
        kuzzle = new Kuzzle(protocols.somewhereagain);

      kuzzle.auth.checkToken = sinon.stub().resolves({
        valid: false
      });
      kuzzle.jwt = jwt;

      return kuzzle.connect()
        .then(() => {
          should(kuzzle.auth.checkToken).be.calledOnce();

          should(kuzzle.jwt).be.null();
        });
    });

    it('should register listeners upon receiving a "disconnect" event', () => {
      const
        kuzzle = new Kuzzle(protocols.somewhere),
        eventStub = sinon.stub();

      kuzzle.realtime.disconnected = sinon.stub();

      kuzzle.addListener('disconnected', eventStub);

      return kuzzle.connect()
        .then(() => kuzzle.protocol.disconnect())
        .then(() => {
          should(kuzzle.realtime.disconnected).be.calledOnce();
          should(eventStub).be.calledOnce();
        });
    });

    it('should register listeners upon receiving a "discarded" event', () => {
      const
        kuzzle = new Kuzzle(protocols.somewhere),
        eventStub = sinon.stub();

      kuzzle.addListener('discarded', eventStub);

      return kuzzle.connect()
        .then(() => kuzzle.protocol.emit('discarded'))
        .then(() => {
          should(eventStub).be.calledOnce();
        });
    });

    it('should stop queuing once connected if autoQueue option is set', () => {
      const
        kuzzle = new Kuzzle(protocols.somewhere);

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
        kuzzle = new Kuzzle(protocols.somewhere);

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
        kuzzle = new Kuzzle(protocols.somewhere);

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
        kuzzle = new Kuzzle(protocols.somewhere);

      kuzzle.autoQueue = true;
      kuzzle.autoReplay = false;
      kuzzle.stopQueuing = sinon.stub();
      kuzzle.playQueue = sinon.stub();

      return kuzzle.connect()
        .then(() => {
          // already called by the mock
          //kuzzle.protocol.emit('connect');

          should(kuzzle.stopQueuing)
            .be.calledOnce();
          should(kuzzle.playQueue)
            .not.be.called();
        });
    });

    it('should start queuing on error if autoQueue is set', () => {
      const
        kuzzle = new Kuzzle(protocols.nowhere);

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
        kuzzle = new Kuzzle(protocols.nowhere);

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
        kuzzle = new Kuzzle(protocols.somewhereagain);

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
        kuzzle = new Kuzzle(protocols.somewhereagain);

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
        kuzzle = new Kuzzle(protocols.somewhereagain);

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
        kuzzle = new Kuzzle(protocols.somewhereagain);

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
