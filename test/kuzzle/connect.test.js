var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Kuzzle connect', function () {
  var 
    networkWrapperRevert,
    kuzzle;

  beforeEach(function () {
    kuzzle = null;
    networkWrapperRevert = Kuzzle.__set__({
      networkWrapper: function(host, port, sslConnection) {
        return new NetworkWrapperMock(host, port, sslConnection);
      }
    });
  });

  afterEach(function() {
    kuzzle.disconnect();
    networkWrapperRevert();
  });

  it('should return the current Kuzzle instance', function () {
    var connectedKuzzle;

    kuzzle = new Kuzzle('somewhere', {connect: 'manual'});
    connectedKuzzle = kuzzle.connect();

    should(connectedKuzzle).be.exactly(kuzzle);
  });

  it('should return immediately if already connected', function (done) {
    kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function (err, res) {
      should(err).be.null();
      should(res).be.exactly(kuzzle);
      should(res.state).be.exactly('connected');
      should(res.network.connectCalled).be.false();
      done();
    });

    kuzzle.state = 'connected';
    kuzzle.connect();
  });

  it('should return immediately if trying to reconnect', function (done) {
    kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function (err, res) {
      should(err).be.null();
      should(res).be.exactly(kuzzle);
      should(res.state).be.exactly('reconnecting');
      should(res.network.connectCalled).be.false();
      done();
    });

    kuzzle.state = 'reconnecting';
    kuzzle.connect();
  });

  it('should first disconnect if it was connected', function () {
    var spy;

    kuzzle = new Kuzzle('somewhere', {connect: 'manual'});

    spy = sinon.spy(kuzzle, 'disconnect');

    kuzzle.connect();
    should(spy.called).be.false();

    kuzzle.connect();
    should(spy.called).be.true();
  });

  it('should try to connect when the instance is in a not-connected state', function () {
    ['initializing', 'ready', 'disconnected', 'error', 'offline'].forEach(function (state) {
      kuzzle = new Kuzzle('somewhere', {connect: 'manual'});

      kuzzle.state = state;
      should(kuzzle.connect()).be.exactly(kuzzle);
      should(kuzzle.network.connectCalled).be.true();
      should(kuzzle.state).be.exactly('connecting');
      kuzzle.disconnect();
    });
  });

  describe('=> on connection error', function () {
    it('should call the provided callback on a connection error', function (done) {
      kuzzle = new Kuzzle('nowhere', {connect: 'manual'}, function (err, res) {
        should(err).be.instanceOf(Error);
        should(err.message).be.exactly('Unable to connect to kuzzle proxy server at "nowhere:7512"');
        should(err.internal.message).be.exactly('Mock Error');
        should(res).be.undefined();
        should(kuzzle.state).be.exactly('error');
        done();
      });
      kuzzle.connect();
    });

    it('should registered listeners upon receiving a error event', function (done) {
      var errorStub = sinon.stub();

      kuzzle = new Kuzzle('nowhere', {connect: 'manual'});
      kuzzle.addListener('networkError', errorStub);

      kuzzle.connect();
      setTimeout(function () {
        should(errorStub).be.calledOnce();
        done();
      }, 10);
    });
  });

  describe('=> on connection success', function () {
    it('should call the provided callback on a connection success', function (done) {
      kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Kuzzle);
        should(res.state).be.exactly('connected');
        done();
      });
      kuzzle.connect();
    });

    it('should registered listeners upon receiving a connect event', function (done) {
      var connectedStub = sinon.stub();
      
      kuzzle = new Kuzzle('somewhere', {connect: 'manual'});
      kuzzle.addListener('connected', connectedStub);

      kuzzle.connect();
      setTimeout(function () {
        should(connectedStub).be.calledOnce();
        done();
      }, 10);
    });

    it('should renew subscriptions automatically on a connection success', function (done) {
      var renewStub = sinon.stub();
      
      kuzzle = new Kuzzle('somewhere', {connect: 'manual', autoResubscribe: false});
      kuzzle.subscriptions.foo = {
        bar: {
          renew: renewStub
        }
      };

      kuzzle.connect();
      should(kuzzle.state).be.exactly('connecting');

      setTimeout(function () {
        should(renewStub).be.calledOnce();
        done();
      }, 10);
    });

    it('should dequeue requests automatically on a connection success', function (done) {
      var dequeueStub = sinon.stub();

      kuzzle = new Kuzzle('somewhere', {connect: 'manual', autoReplay: false, autoQueue: false});
      kuzzle.queuing = true;
      kuzzle.offlineQueue.push({query: 'foo'});
      kuzzle.addListener('offlineQueuePop', dequeueStub);
      kuzzle.connect();

      setTimeout(function () {
        should(dequeueStub).be.calledOnce();
        should(kuzzle.state).be.exactly('connected');
        should(kuzzle.queuing).be.false();
        should(kuzzle.offlineQueue).be.empty();
        done();
      },100);
    });
  });

  describe('=> on disconnection', function () {
    it('should enter offline mode and call listeners', function (done) {
      var disconnectStub = sinon.stub();

      kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function() {
        kuzzle.network.disconnect();
      });

      kuzzle.addListener('disconnected', disconnectStub);
      kuzzle.connect();

      setTimeout(function() {
        should(kuzzle.state).be.exactly('offline');
        should(kuzzle.queuing).be.false();
        should(disconnectStub).be.calledOnce();
        kuzzle.isValid();
        done();
      }, 10);
    });

    it('should enable queuing if autoQueue is set to true', function (done) {
      kuzzle = new Kuzzle('somewhere', {connect: 'manual', autoQueue: true}, function() {
        kuzzle.network.disconnect();
      });

      kuzzle.connect();
      setTimeout(function() {
        should(kuzzle.state).be.exactly('offline');
        should(kuzzle.queuing).be.true();
        kuzzle.isValid();
        done();
      }, 10);
    });

    it('should invalidate the instance if autoReconnect is set to false', function (done) {
      kuzzle = new Kuzzle('somewhere', {connect: 'manual', autoReconnect: false}, function() {
        kuzzle.network.disconnect();
      });

      kuzzle.connect();
      setTimeout(function() {
        should(kuzzle.state).be.exactly('disconnected');
        should(kuzzle.queuing).be.false();
        should(function () {
          kuzzle.isValid();
        }).throw();
        done();
      }, 10);
    });
  });

  describe('=> on reconnection', function () {
    it('should exit offline mode when reconnecting', function (done) {
      var reconnectStub = sinon.stub();
      
      kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'});
      kuzzle.addListener('reconnected', reconnectStub);
      kuzzle.queuing = true;
      kuzzle.connect();

      setTimeout(function () {
        should(kuzzle.state).be.exactly('connected');
        should(reconnectStub).be.calledOnce();
        // should not switch queuing to 'false' automatically by default
        should(kuzzle.queuing).be.true();
        kuzzle.isValid();
        done();
      }, 10);
    });

    it('should renew subscriptions automatically when exiting offline mode', function (done) {
      var renewStub = sinon.stub();
      
      kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'});
      kuzzle.subscriptions.foo = {
        bar: {
          renew: renewStub
        }
      };
      kuzzle.connect();

      setTimeout(function () {
        should(kuzzle.state).be.exactly('connected');
        should(renewStub).be.calledOnce();
        kuzzle.isValid();
        done();
      }, 10);
    });

    it('should not renew subscriptions if autoResubscribe is set to false', function (done) {
      var renewStub = sinon.stub();
      
      kuzzle = new Kuzzle('somewhereagain', {connect: 'manual', autoResubscribe: false});
      kuzzle.subscriptions.foo = {
        bar: {
          renew: renewStub
        }
      };
      kuzzle.connect();

      setTimeout(function () {
        should(kuzzle.state).be.exactly('connected');
        should(renewStub).not.be.called();
        kuzzle.isValid();
        done();
      }, 10);
    });

    it('should replay pending requests automatically if autoReplay is set to true', function (done) {
      var dequeueStub = sinon.stub();
      
      kuzzle = new Kuzzle('somewhereagain', {connect: 'manual', autoReplay: true});
      kuzzle.queuing = true;
      kuzzle.offlineQueue.push({query: 'foo'});
      kuzzle.addListener('offlineQueuePop', dequeueStub);
      kuzzle.connect();

      setTimeout(function () {
        should(dequeueStub).be.calledOnce();
        should(kuzzle.state).be.exactly('connected');
        should(kuzzle.queuing).be.false();
        kuzzle.isValid();
        done();
      }, 100);
    });

    it('should empty the JWT Token if it has expired', function (done) {
      var tokenExpiredStub = sinon.stub();
      
      kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'});

      sinon.stub(kuzzle, 'checkToken').callsFake(function (token, cb) {
        should(token).be.eql(kuzzle.jwtToken);
        cb(null, {valid: false});
      });

      kuzzle.jwtToken = 'foobar';
      kuzzle.addListener('tokenExpired', tokenExpiredStub);
      kuzzle.connect();

      setTimeout(function () {
        should(kuzzle.state).be.exactly('connected');
        should(kuzzle.jwtToken).be.undefined();
        should(tokenExpiredStub).be.calledOnce();
        done();
      }, 10);
    });
  });

  describe('#disconnect', function () {
    it('should clean up and invalidate the instance if called', function () {
      kuzzle = new Kuzzle('somewhere');

      kuzzle.collections = { foo: {}, bar: {}, baz: {} };
      kuzzle.disconnect();

      should(kuzzle.network).be.null();
      should(kuzzle.collections).be.empty();
      should(function () { kuzzle.isValid(); }).throw(Error);
    });
  });
});
