var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Kuzzle connect', function () {
  var
    clock,
    networkWrapperRevert;

  beforeEach(function () {
    networkWrapperRevert = Kuzzle.__set__({
      networkWrapper: function(protocol, host, options) {
        return new NetworkWrapperMock(host, options);
      }
    });
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    networkWrapperRevert();
    clock.restore();
  });

  it('should return the current Kuzzle instance', function () {
    var
      kuzzle = new Kuzzle('somewhere', {connect: 'manual'}),
      connectedKuzzle = kuzzle.connect();

    should(connectedKuzzle).be.exactly(kuzzle);
  });

  it('should return immediately if already connected', function () {
    var promises = [];
    ['connecting', 'ready', 'connected'].forEach(function (state) {
      promises.push(new Promise(function(resolve) {
        var kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function (err, res) {
          should(err).be.null();
          should(res).be.exactly(kuzzle);
          should(res.network.connectCalled).be.false();
          should(res.network.state).be.exactly(state);
          resolve();
        });
        kuzzle.network.state = state;
        kuzzle.connect();
      }));
    });
    clock.tick();
    Promise.all(promises);
  });

  it('should call network wrapper connect() method when the instance is offline', function () {
    var kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function (err, res) {
      should(err).be.null();
      should(res).be.exactly(kuzzle);
      should(res.network.state).be.exactly('connected');
      should(res.network.connectCalled).be.true();
    });
    kuzzle.network.state = 'offline';
    kuzzle.connect();
    clock.tick();
  });

  describe('=> Connection Events', function () {
    it('should registered listeners upon receiving a "error" event', function () {
      var
        kuzzle = new Kuzzle('nowhere', {connect: 'manual'}),
        eventStub = sinon.stub();

      kuzzle.addListener('networkError', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should registered listeners upon receiving a "connect" event', function () {
      var
        kuzzle = new Kuzzle('somewhere', {connect: 'manual'}),
        eventStub = sinon.stub();

      kuzzle.addListener('connected', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should registered listeners upon receiving a "reconnect" event', function () {
      var
        kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'}),
        eventStub = sinon.stub();

      kuzzle.addListener('reconnected', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should keep a valid JWT Token at reconnection', function () {
      var
        kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'}),
        eventStub = sinon.stub();

      kuzzle.checkToken = sinon.stub();

      kuzzle.jwt = 'foobar';
      kuzzle.addListener('tokenExpired', eventStub);

      kuzzle.connect();
      clock.tick();

      should(kuzzle.checkToken).be.calledOnce();
      should(kuzzle.checkToken).be.calledWith('foobar');
      kuzzle.checkToken.yield(null, {valid: true});

      should(kuzzle.jwt).be.eql('foobar');
      should(eventStub).not.be.called();
    });

    it('should empty the JWT Token at reconnection if it has expired', function () {
      var
        kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'}),
        eventStub = sinon.stub();

      kuzzle.checkToken = sinon.stub();

      kuzzle.jwt = 'foobar';
      kuzzle.addListener('tokenExpired', eventStub);

      kuzzle.connect();
      clock.tick();

      should(kuzzle.checkToken).be.calledOnce();
      should(kuzzle.checkToken).be.calledWith('foobar');
      kuzzle.checkToken.yield(null, {valid: false});

      should(kuzzle.jwt).be.undefined();
      should(eventStub).be.calledOnce();
    });

    it('should registered listeners upon receiving a "disconnect" event', function () {
      var
        kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function() {
          kuzzle.network.disconnect();
        }),
        eventStub = sinon.stub();

      kuzzle.addListener('disconnected', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should registered listeners upon receiving a "discarded" event', function () {
      var
        kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function() {
          kuzzle.network.emitEvent('discarded');
        }),
        eventStub = sinon.stub();

      kuzzle.addListener('discarded', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });
  });
});

/*
    it('should renew subscriptions automatically on a connection success', function (done) {
      var
        kuzzle = new Kuzzle('somewhere', {connect: 'manual', autoResubscribe: false}),
        renewStub = sinon.stub();

      kuzzle.subscriptions.foo = {
        bar: {
          renew: renewStub
        }
      };

      kuzzle.connect();
      should(kuzzle.network.state).be.exactly('connecting');

      setTimeout(function () {
        should(renewStub).be.calledOnce();
        done();
      });
      clock.tick();
    });

    it('should renew subscriptions automatically when exiting offline mode', function (done) {
      var
        kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'}),
        renewStub = sinon.stub();

      kuzzle.subscriptions.foo = {
        bar: {
          renew: renewStub
        }
      };
      kuzzle.connect();

      setTimeout(function () {
        should(kuzzle.state).be.exactly('connected');
        should(renewStub).be.calledOnce();
        done();
      });
    });

    it('should not renew subscriptions if autoResubscribe is set to false', function (done) {
      var
        kuzzle = new Kuzzle('somewhereagain', {connect: 'manual', autoResubscribe: false}),
        renewStub = sinon.stub();

      kuzzle.subscriptions.foo = {
        bar: {
          renew: renewStub
        }
      };
      kuzzle.connect();

      setTimeout(function () {
        should(kuzzle.state).be.exactly('connected');
        should(renewStub).not.be.called();
        done();
      });
    });
*/
