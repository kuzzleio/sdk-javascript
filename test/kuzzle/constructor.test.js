var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  EventEmitter = require('events').EventEmitter,
  Kuzzle = rewire('../../src/kuzzle');

describe('Kuzzle constructor', () => {
  it('should expose the documented functions', () => {
    var kuzzle = new Kuzzle('nowhere');

    should.exist(kuzzle.addListener);
    should.exist(kuzzle.dataCollectionFactory);
    should.exist(kuzzle.flushQueue);
    should.exist(kuzzle.getAllStatistics);
    should.exist(kuzzle.getStatistics);
    should.exist(kuzzle.listCollections);
    should.exist(kuzzle.logout);
    should.exist(kuzzle.now);
    should.exist(kuzzle.query);
    should.exist(kuzzle.removeAllListeners);
    should.exist(kuzzle.removeListener);
    should.exist(kuzzle.replayQueue);
    should.exist(kuzzle.setHeaders);
    should.exist(kuzzle.startQueuing);
    should.exist(kuzzle.stopQueuing);
  });

  it('should expose the documented properties', () => {
    var kuzzle = new Kuzzle('nowhere');

    kuzzle.should.have.enumerable('autoQueue');
    kuzzle.should.have.enumerable('autoReconnect');
    kuzzle.should.have.enumerable('autoReplay');
    kuzzle.should.have.enumerable('autoResubscribe');
    kuzzle.should.have.enumerable('offlineQueue');
    kuzzle.should.have.enumerable('queueFilter');
    kuzzle.should.have.enumerable('queueMaxSize');
    kuzzle.should.have.enumerable('queueTTL');
    kuzzle.should.have.enumerable('headers');
    kuzzle.should.have.enumerable('metadata');
    kuzzle.should.have.enumerable('replayInterval');
    kuzzle.should.have.enumerable('reconnectionDelay');
  });

  it('should have properties with the documented default values', () => {
    var kuzzle = new Kuzzle('nowhere');

    should(kuzzle.autoQueue).be.false();
    should(kuzzle.autoReconnect).be.true();
    should(kuzzle.autoReplay).be.false();
    should(kuzzle.autoResubscribe).be.true();
    should(kuzzle.queueTTL).be.exactly(120000);
    should(kuzzle.queueMaxSize).be.exactly(500);
    should(kuzzle.headers).be.an.Object().and.be.empty();
    should(kuzzle.metadata).be.an.Object().and.be.empty();
    should(kuzzle.replayInterval).be.exactly(10);
    should(kuzzle.reconnectionDelay).be.exactly(1000);
  });

  it('should initialize correctly properties using the "options" argument', () => {
    var
      options = {
        autoQueue: true,
        autoReconnect: false,
        autoReplay: true,
        autoResubscribe: false,
        queueTTL: 123,
        queueMaxSize: 42,
        headers: {foo: 'bar'},
        metadata: {foo: ['bar', 'baz', 'qux'], bar: 'foo'},
        replayInterval: 99999,
        reconnectionDelay: 666
      },
      kuzzle = new Kuzzle('nowhere', options);

    should(kuzzle.autoQueue).be.exactly(options.autoQueue);
    should(kuzzle.autoReconnect).be.exactly(options.autoReconnect);
    should(kuzzle.autoReplay).be.exactly(options.autoReplay);
    should(kuzzle.autoResubscribe).be.exactly(options.autoResubscribe);
    should(kuzzle.queueTTL).be.exactly(options.queueTTL);
    should(kuzzle.queueMaxSize).be.exactly(options.queueMaxSize);
    should(kuzzle.headers).be.an.Object().and.match(options.headers);
    should(kuzzle.metadata).be.an.Object().and.match(options.metadata);
    should(kuzzle.replayInterval).be.exactly(options.replayInterval);
    should(kuzzle.reconnectionDelay).be.exactly(options.reconnectionDelay);
  });

  it('should handle the offlineMode option properly', () => {
    var kuzzle = new Kuzzle('nowhere', {offlineMode: 'auto'});

    should(kuzzle.autoQueue).be.true();
    should(kuzzle.autoReconnect).be.true();
    should(kuzzle.autoReplay).be.true();
    should(kuzzle.autoResubscribe).be.true();
  });

  it('should return a new instance even if not called with "new"', () => {
    var kuzzle = Kuzzle('nowhere');

    kuzzle.should.be.instanceof(Kuzzle);
  });

  it('should allow passing a callback and respond once initialized', function (done) {
    this.timeout(500);

    new Kuzzle('nowhere', () => {
      try {
        kuzzle.isValid();
        done('Error: the kuzzle object should have been invalidated');
      }
      catch(e) {
        done();
      }
    });
  });

  it('should promisify the right functions', () => {
    var kuzzle;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('nowhere');

    should.not.exist(kuzzle.addListenerPromise);
    should.not.exist(kuzzle.dataCollectionFactoryPromise);
    should.not.exist(kuzzle.flushQueuePromise);
    should.exist(kuzzle.getAllStatisticsPromise);
    should.exist(kuzzle.getStatisticsPromise);
    should.exist(kuzzle.listCollectionsPromise);
    should.not.exist(kuzzle.logoutPromise);
    should.exist(kuzzle.nowPromise);
    should.exist(kuzzle.queryPromise);
    should.not.exist(kuzzle.removeAllListenersPromise);
    should.not.exist(kuzzle.removeListenerPromise);
    should.not.exist(kuzzle.replayQueuePromise);
    should.not.exist(kuzzle.setHeadersPromise);
    should.not.exist(kuzzle.startQueuingPromise);
    should.not.exist(kuzzle.stopQueuingPromise);
  });

  it('should throw an error if no URL is provided', () => {
    try {
      new Kuzzle();
      should.fail('success', 'failure', 'Constructor should fail with no URL provided', '');
    }
    catch (e) {

    }
  });

  describe('#on connection success', () => {
    var
      iostub = function () {
        var emitter = new EventEmitter;
        process.nextTick(() => emitter.emit('connect'));
        return emitter;
      };

    it('should call the provided callback on a connection success', function (done) {
      this.timeout(50);

      Kuzzle.__with__({
        io: iostub
      })(function () {
        new Kuzzle('nowhere', function (err, res) {
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
      })
    });
  });

  describe('# on disconnection', () => {
    var
      iostub = function () {
        var emitter = new EventEmitter;

        /*
        since we're stubbing the socket.io socket object,
        we need a stubbed 'close' function to make kuzzle.logout() work
         */
        emitter.close = function () { return false; };
        process.nextTick(() => emitter.emit('disconnect'));
        return emitter;
      };

    before(function () {
      Kuzzle.__set__('io', iostub);
    });


    it('should enter offline mode and call listeners', function (done) {
      var
        kuzzle = new Kuzzle('nowhere'),
        listenerCalled = false;

      this.timeout(200);

      kuzzle.eventListeners.disconnected.push(function () { listenerCalled = true; });

      setTimeout(() => {
        try {
          should(kuzzle.state).be.exactly('offline');
          should(kuzzle.queuing).be.false();
          should(listenerCalled).be.true();
          kuzzle.isValid();
          done();
        }
        catch (e) {
          done(e);
        }
      }, 10);
    });

    it('should enable queuing if autoQueue is set to true', function (done) {
      var kuzzle = new Kuzzle('nowhere', {autoQueue: true});
      this.timeout(200);

      setTimeout(() => {
        try {
          should(kuzzle.state).be.exactly('offline');
          should(kuzzle.queuing).be.true();
          kuzzle.isValid();
          done();
        }
        catch (e) {
          done(e);
        }
      }, 10);
    });

    it('should invalidated the instance if autoReconnect is set to false', function (done) {
      var kuzzle = new Kuzzle('nowhere', {autoReconnect: false});

      this.timeout(200);

      setTimeout(() => {
        try {
          should(kuzzle.state).be.exactly('offline');
          should(kuzzle.queuing).be.false();
          kuzzle.isValid();
          done('the kuzzle instance should have been invalidated');
        }
        catch (e) {
          done();
        }
      }, 10);
    });
  });

  describe('#on reconnection', () => {
    var
      iostub = function () {
        var emitter = new EventEmitter;
        process.nextTick(() => emitter.emit('reconnect'));
        return emitter;
      };

    before(function () {
      Kuzzle.__set__('io', iostub);
    });

    it('should exit offline mode when reconnecting', function (done) {
      var
        kuzzle = new Kuzzle('nowhere'),
        listenersCalled = false;

      this.timeout(200);

      kuzzle.eventListeners.reconnected.push(function () { listenersCalled = true; });
      kuzzle.queuing = true;

      setTimeout(() => {
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
        kuzzle = new Kuzzle('nowhere'),
        renewCalled = false,
        stubKuzzleRoom = {
          callback: function () { renewCalled = true; },
          renew: function (cb) { cb(); }
        };

      this.timeout(200);

      kuzzle.subscriptions['foo'] = { bar: stubKuzzleRoom };

      setTimeout(() => {
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
        kuzzle = new Kuzzle('nowhere', {autoResubscribe: false}),
        renewCalled = false,
        stubKuzzleRoom = {
          callback: function () { renewCalled = true; },
          renew: function (cb) { cb(); }
        };

      this.timeout(200);

      kuzzle.subscriptions['foo'] = {
        bar: stubKuzzleRoom
      };

      setTimeout(() => {
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
        kuzzle = new Kuzzle('nowhere', {autoReplay: true});

      this.timeout(200);

      kuzzle.queuing = true;

      setTimeout(() => {
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
  });
});
