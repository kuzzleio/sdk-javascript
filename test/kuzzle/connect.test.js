var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Kuzzle connect', function () {

  var networkWrapperRevert;

  beforeEach(function () {
    networkWrapperRevert = Kuzzle.__set__({
      networkWrapper: function(host, port, sslConnection) {
        return new NetworkWrapperMock(host, port, sslConnection);
      }
    });
  });
  afterEach(function() {
    networkWrapperRevert();
  });

  it('should return immediately if already connected', function (done) {
    var kuzzle;

    this.timeout(200);

    kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function (err, res) {
      should(err).be.null();
      should(res).be.exactly(kuzzle);
      should(res.state).be.exactly('connected');
      done();
    });

    kuzzle.state = 'connected';
    kuzzle.connect();
  });

  it('should return immediately if trying to reconnect', function (done) {
    var kuzzle;

    this.timeout(200);

    kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function (err, res) {
      should(err).be.null();
      should(res).be.exactly(kuzzle);
      should(res.state).be.exactly('reconnecting');
      done();
    });

    kuzzle.state = 'reconnecting';
    kuzzle.connect();
  });

  it('should try to connect when the instance is in a not-connected state', function () {
    ['initializing', 'ready', 'disconnected', 'error', 'offline'].forEach(function (state) {
      var kuzzle = new Kuzzle('somewhere', {connect: 'manual'});

      kuzzle.state = state;
      should(kuzzle.connect()).be.exactly(kuzzle);
      should(kuzzle.state).be.exactly('connecting');
    });
  });

  it('should registered listeners upon receiving a connect event', function (done) {
    var
      kuzzle = new Kuzzle('somewhere', {connect: 'manual'}),
      listenerCalled = false;

    kuzzle.state = 'initializing';
    kuzzle.addListener('connected', function () {listenerCalled = true;});

    kuzzle.connect();

    setTimeout(function () {
      should(listenerCalled).be.true();
      done();
    }, 10);

  });

  it('should first disconnect if it was connected', function () {
    var
      kuzzle = new Kuzzle('somewhere', {connect: 'manual'});

    kuzzle.disconnect = sinon.stub();
    kuzzle.connect();

    should(kuzzle.disconnect.called).be.false();

    kuzzle.connect();
    should(kuzzle.disconnect.called).be.true();
  });

  describe('=> on connection error', function () {
    it('should call the provided callback on a connection error', function (done) {
      var kuzzle;

      this.timeout(200);
      kuzzle = new Kuzzle('nowhere', function (err, res) {
        try {
          should(err).be.instanceOf(Error);
          should(err.message).be.exactly('Unable to connect to kuzzle proxy server at "nowhere"');
          should(err.internal.message).be.exactly('Mock Error');
          should(res).be.undefined();
          should(kuzzle.state).be.exactly('error');
          done();
        }
        catch (e) {
          done(e);
        }
      });
    });

    it('should registered listeners upon receiving a error event', function (done) {
      var
        listenerCalled,
        kuzzle = new Kuzzle('nowhere');

      kuzzle.addListener('networkError', function () { listenerCalled = true; });

      setTimeout(function () {
        try {
          should(listenerCalled).be.true();
          done();
        }
        catch (e) {
          done(e);
        }
      }, 10);
    });
  });

  describe('=> on connection success', function () {
    it('should call the provided callback on a connection success', function (done) {
      this.timeout(200);

      new Kuzzle('somewhere', function (err, res) {
        try {
          should(err).be.null();
          should(res).be.instanceof(Kuzzle);
          should(res.state).be.exactly('connected');
          done();
        }
        catch (e) {
          done(e);
        }
      });
    });

    it('should renew subscriptions automatically on a connection success', function (done) {
      var
        kuzzle,
        renewed = false;

      this.timeout(200);

      kuzzle = new Kuzzle('somewhere', {connect: 'manual', autoResubscribe: false});
      kuzzle.subscriptions.foo = {
        bar: {
          renew: function () { renewed = true; }
        }
      };

      kuzzle.connect();
      should(kuzzle.state).be.exactly('connecting');

      setTimeout(function () {
        should(renewed).be.true();
        done();
      }, 20);
    });

    it('should dequeue requests automatically on a connection success', function (done) {
      var
        dequeueStub = sinon.stub(),
        kuzzle;

      this.timeout(500);

      kuzzle = new Kuzzle('somewhere', {connect: 'manual', autoReplay: false, autoQueue: false});

      kuzzle.queuing = true;
      kuzzle.offlineQueue.push({query: 'foo'});
      kuzzle.addListener('offlineQueuePop', dequeueStub);
      kuzzle.connect();

      setTimeout(function () {
        should(dequeueStub.called).be.true();
        should(kuzzle.state).be.exactly('connected');
        should(kuzzle.queuing).be.false();
        should(kuzzle.offlineQueue).be.empty();
        done();
      }, 20);
    });
  });

  describe('=> on disconnection', function () {
    it('should enter offline mode and call listeners', function () {
      var
        kuzzle = new Kuzzle('somewhere'),
        listenerCalled = false;

      kuzzle.addListener('disconnected', function () { listenerCalled = true; });

      kuzzle.network.disconnect();

      should(kuzzle.state).be.exactly('offline');
      should(kuzzle.queuing).be.false();
      should(listenerCalled).be.true();
      kuzzle.isValid();
    });

    it('should enable queuing if autoQueue is set to true', function () {
      var kuzzle = new Kuzzle('somewhere', {autoQueue: true});

      kuzzle.network.disconnect();
      should(kuzzle.state).be.exactly('offline');
      should(kuzzle.queuing).be.true();
      kuzzle.isValid();
    });

    it('should invalidated the instance if autoReconnect is set to false', function () {
      var kuzzle = new Kuzzle('somewhere', {autoReconnect: false});

      kuzzle.network.disconnect();
      should(kuzzle.state).be.exactly('disconnected');
      should(kuzzle.queuing).be.false();
      should(function () {
        kuzzle.isValid();
      }).throw();
    });
  });

  describe('=> on reconnection', function () {
    it('should exit offline mode when reconnecting', function (done) {
      var
        kuzzle = new Kuzzle('somewhereagain'),
        listenersCalled = false;

      this.timeout(200);

      kuzzle.addListener('reconnected', function () { listenersCalled = true; });
      kuzzle.queuing = true;

      setTimeout(function () {
        try {
          should(kuzzle.state).be.exactly('connected');
          should(listenersCalled).be.true();
          // should not switch queuing to 'false' automatically by default
          should(kuzzle.queuing).be.true();
          kuzzle.isValid();
          done();
        }
        catch (e) {
          done(e);
        }
      }, 10);
    });

    it('should renew subscriptions automatically when exiting offline mode', function (done) {
      var
        kuzzle = new Kuzzle('somewhereagain'),
        renewCalled = false,
        stubKuzzleRoom = {
          callback: function () { renewCalled = true; },
          renew: function (cb) { cb(); }
        };


      this.timeout(200);

      kuzzle.subscriptions.foo = { bar: stubKuzzleRoom };

      setTimeout(function () {
        try {
          should(kuzzle.state).be.exactly('connected');
          should(renewCalled).be.true();
          kuzzle.isValid();
          done();
        }
        catch (e) {
          done(e);
        }
      }, 10);
    });

    it('should not renew subscriptions if autoResubscribe is set to false', function (done) {
      var
        kuzzle = new Kuzzle('somewhereagain', {autoResubscribe: false}),
        renewCalled = false,
        stubKuzzleRoom = {
          callback: function () { renewCalled = true; },
          renew: function (cb) { cb(); }
        };

      this.timeout(200);

      kuzzle.subscriptions.foo = {
        bar: stubKuzzleRoom
      };

      setTimeout(function () {
        try {
          should(kuzzle.state).be.exactly('connected');
          should(renewCalled).be.false();
          kuzzle.isValid();
          done();
        }
        catch (e) {
          done(e);
        }
      }, 10);
    });

    it('should replay pending requests automatically if autoReplay is set to true', function (done) {
      var
        kuzzle = new Kuzzle('somewhereagain', {autoReplay: true});

      this.timeout(200);

      kuzzle.queuing = true;

      setTimeout(function () {
        try {
          should(kuzzle.state).be.exactly('connected');
          should(kuzzle.queuing).be.false();
          kuzzle.isValid();
          done();
        }
        catch (e) {
          done(e);
        }
      }, 10);
    });

    it('should empty the JWT Token if it has expired', function (done) {
      var
        kuzzle = new Kuzzle('somewhereagain', {}),
        eventEmitted = false;

      this.timeout(200);
      kuzzle.jwtToken = 'foobar';
      kuzzle.addListener('jwtTokenExpired', function () {eventEmitted = true;});

      kuzzle.checkToken = function (token, cb) {
        should(token).be.eql(kuzzle.jwtToken);
        cb(null, {valid: false});
      };

      setTimeout(function () {
        try {
          should(kuzzle.state).be.exactly('connected');
          should(kuzzle.jwtToken).be.undefined();
          should(eventEmitted).be.true();
          done();
        }
        catch (e) {
          done(e);
        }
      }, 10);
    });
  });
});
