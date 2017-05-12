var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  bluebird = require('bluebird'),
  proxyquire = require('proxyquire'),
  NetworkWrapper = require('../../src/networkWrapper/wrappers/websocket'),
  kuzzleSource = '../../src/Kuzzle';

describe('Kuzzle constructor', function () {
  var
    Kuzzle,
    networkStub;

  beforeEach(function () {
    networkStub = sinon.stub(new NetworkWrapper('address', 'port', false));
  });

  describe('#constructor', function () {
    before(function () {
      Kuzzle = proxyquire(kuzzleSource, {
        './networkWrapper' : function () {
          return networkStub;
        }
      });
    });

    it('should expose the documented functions', function () {
      var kuzzle;

      kuzzle = new Kuzzle('nowhere');

      should.exist(kuzzle.addListener);
      should.exist(kuzzle.collection);
      should.exist(kuzzle.flushQueue);
      should.exist(kuzzle.getAllStatistics);
      should.exist(kuzzle.getJwtToken);
      should.exist(kuzzle.getStatistics);
      should.exist(kuzzle.listCollections);
      should.exist(kuzzle.disconnect);
      should.exist(kuzzle.login);
      should.exist(kuzzle.logout);
      should.exist(kuzzle.now);
      should.exist(kuzzle.query);
      should.exist(kuzzle.removeAllListeners);
      should.exist(kuzzle.removeListener);
      should.exist(kuzzle.replayQueue);
      should.exist(kuzzle.setHeaders);
      should.exist(kuzzle.startQueuing);
      should.exist(kuzzle.stopQueuing);
      should.exist(kuzzle.setJwtToken);
      should.exist(kuzzle.unsetJwtToken);
    });

    it('should expose the documented properties', function () {
      var kuzzle = new Kuzzle('nowhere');

      should(kuzzle).have.propertyWithDescriptor('autoQueue', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoReconnect', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoReplay', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoResubscribe', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('defaultIndex', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('offlineQueue', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueFilter', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueMaxSize', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueTTL', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('volatile', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('replayInterval', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('reconnectionDelay', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('jwtToken', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('offlineQueueLoader', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('port', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('sslConnection', { enumerable: true, writable: true, configurable: false });
    });

    it('should have properties with the documented default values', function () {
      var kuzzle = new Kuzzle('nowhere');

      should(kuzzle.autoQueue).be.false();
      should(kuzzle.autoReconnect).be.true();
      should(kuzzle.autoReplay).be.false();
      should(kuzzle.autoResubscribe).be.true();
      should(kuzzle.queueTTL).be.exactly(120000);
      should(kuzzle.queueMaxSize).be.exactly(500);
      should(kuzzle.headers).be.an.Object().and.be.empty();
      should(kuzzle.volatile).be.an.Object().and.be.empty();
      should(kuzzle.replayInterval).be.exactly(10);
      should(kuzzle.reconnectionDelay).be.exactly(1000);
      should(kuzzle.defaultIndex).be.undefined();
      should(kuzzle.port).be.exactly(7512);
      should(kuzzle.sslConnection).be.false();
    });

    it('should initialize correctly properties using the "options" argument', function () {
      var
        options = {
          autoQueue: true,
          autoReconnect: false,
          autoReplay: true,
          autoResubscribe: false,
          queueTTL: 123,
          queueMaxSize: 42,
          headers: {foo: 'bar'},
          volatile: {foo: ['bar', 'baz', 'qux'], bar: 'foo'},
          replayInterval: 99999,
          reconnectionDelay: 666,
          defaultIndex: 'foobar',
          port: 1234,
          sslConnection: true
        },
        kuzzle = new Kuzzle('nowhere', options);

      should(kuzzle.autoQueue).be.exactly(options.autoQueue);
      should(kuzzle.autoReconnect).be.exactly(options.autoReconnect);
      should(kuzzle.autoReplay).be.exactly(options.autoReplay);
      should(kuzzle.autoResubscribe).be.exactly(options.autoResubscribe);
      should(kuzzle.defaultIndex).be.exactly('foobar');
      should(kuzzle.queueTTL).be.exactly(options.queueTTL);
      should(kuzzle.queueMaxSize).be.exactly(options.queueMaxSize);
      should(kuzzle.headers).be.an.Object().and.match(options.headers);
      should(kuzzle.volatile).be.an.Object().and.match(options.volatile);
      should(kuzzle.replayInterval).be.exactly(options.replayInterval);
      should(kuzzle.reconnectionDelay).be.exactly(options.reconnectionDelay);
      should(kuzzle.port).be.exactly(options.port);
      should(kuzzle.sslConnection).be.exactly(options.sslConnection);
    });

    it('should handle the offlineMode option properly', function () {
      var kuzzle = new Kuzzle('nowhere', {offlineMode: 'auto'});

      should(kuzzle.autoQueue).be.true();
      should(kuzzle.autoReconnect).be.true();
      should(kuzzle.autoReplay).be.true();
      should(kuzzle.autoResubscribe).be.true();
    });

    it('should handle the connect option properly', function () {
      var kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

      should(kuzzle.state).be.exactly('ready');
      should(networkStub.connect.called).be.false();

      kuzzle = new Kuzzle('nowhere', {connect: 'auto'});
      should(kuzzle.state).be.exactly('connecting');
      should(networkStub.connect.called).be.true();
    });

    it('should return a new instance even if not called with "new"', function () {
      var kuzzle = Kuzzle('nowhere');

      kuzzle.should.be.instanceof(Kuzzle);
    });

    it('should allow passing a callback and respond once initialized', function (done) {
      var kuzzle;

      this.timeout(500);

      networkStub.onConnect = function (cb) {
        process.nextTick(function () {
          cb();
        });
      };

      kuzzle = new Kuzzle('nowhere', function () {
        kuzzle.state = 'disconnected';
        try {
          kuzzle.isValid();
          done('Error: the kuzzle object should have been invalidated');
        }
        catch (e) {
          done();
        }
      });
    });

    it('should promisify the right functions', function () {
      var kuzzle;

      Kuzzle.prototype.bluebird = bluebird;
      kuzzle = new Kuzzle('nowhere');

      should.not.exist(kuzzle.addListenerPromise);
      should.not.exist(kuzzle.connectPromise);
      should.not.exist(kuzzle.dataCollectionFactoryPromise);
      should.not.exist(kuzzle.flushQueuePromise);
      should.exist(kuzzle.getAllStatisticsPromise);
      should.not.exist(kuzzle.getJwtTokenPromise);
      should.exist(kuzzle.getServerInfoPromise);
      should.exist(kuzzle.getStatisticsPromise);
      should.exist(kuzzle.listCollectionsPromise);
      should.exist(kuzzle.listIndexesPromise);
      should.exist(kuzzle.loginPromise);
      should.exist(kuzzle.logoutPromise);
      should.exist(kuzzle.nowPromise);
      should.exist(kuzzle.queryPromise);
      should.exist(kuzzle.checkTokenPromise);
      should.exist(kuzzle.whoAmIPromise);
      should.not.exist(kuzzle.removeAllListenersPromise);
      should.not.exist(kuzzle.removeListenerPromise);
      should.not.exist(kuzzle.replayQueuePromise);
      should.not.exist(kuzzle.setJwtTokenPromise);
      should.not.exist(kuzzle.unsetJwtTokenPromise);
      should.not.exist(kuzzle.setHeadersPromise);
      should.not.exist(kuzzle.startQueuingPromise);
      should.not.exist(kuzzle.stopQueuingPromise);
    });

    it('should throw an error if no URL is provided', function () {
      should(function () {
        new Kuzzle();
      }).throw();
    });

    describe('#connect', function () {
      it('should return immediately if already connected', function (done) {
        var kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {connect: 'manual'}, function (err, res) {
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

        kuzzle = new Kuzzle('nowhere', {connect: 'manual'}, function (err, res) {
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
          var kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

          kuzzle.state = state;
          should(kuzzle.connect()).be.exactly(kuzzle);
          should(kuzzle.state).be.exactly('connecting');
        });
      });

      it('should registered listeners upon receiving a connect event', function (done) {
        var
          kuzzle = new Kuzzle('nowhere', {connect: 'manual'}),
          listenerCalled = false;

        kuzzle.state = 'initializing';
        kuzzle.addListener('connected', function () {listenerCalled = true;});

        networkStub.onConnect = function (cb) {
          process.nextTick(function () {
            cb();
          });
        };

        kuzzle.connect();

        setTimeout(function () {
          should(listenerCalled).be.true();
          done();
        }, 10);
      });

      it('should first disconnect if it was connected', function () {
        var
          kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

        kuzzle.disconnect = sinon.stub();
        kuzzle.connect();

        should(kuzzle.disconnect.called).be.false();

        kuzzle.connect();
        should(kuzzle.disconnect.called).be.true();
      });

      describe('=> on connection error', function () {
        beforeEach(function () {
          networkStub.onConnectError = function (cb) {
            process.nextTick(function () { cb('error'); });
          };
        });

        it('should call the provided callback on a connection error', function (done) {
          var kuzzle;

          this.timeout(200);

          kuzzle = new Kuzzle('nowhere', function (err, res) {
            try {
              should(err).be.instanceOf(Error);
              should(err.message).be.exactly('Unable to connect to kuzzle proxy server at "nowhere"');
              should(err.internal).be.exactly('error');
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
        beforeEach(function () {
          networkStub.onConnect = function (cb) {
            setTimeout(function () { cb(); }, 0);
          };
        });

        it('should call the provided callback on a connection success', function (done) {
          this.timeout(200);

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
        });

        it('should renew subscriptions automatically on a connection success', function (done) {
          var
            kuzzle,
            renewed = false;

          this.timeout(200);

          kuzzle = new Kuzzle('nowhere', {connect: 'manual', autoResubscribe: false});
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

          kuzzle = new Kuzzle('nowhere', {connect: 'manual', autoReplay: false, autoQueue: false});

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
        beforeEach(function () {
          networkStub.onDisconnect = function (cb) {
            setTimeout(function () { cb(); }, 0);
          };
        });

        it('should enter offline mode and call listeners', function (done) {
          var
            kuzzle = new Kuzzle('nowhere'),
            listenerCalled = false;

          this.timeout(200);

          kuzzle.addListener('disconnected', function () { listenerCalled = true; });

          setTimeout(function () {
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
          }, 100);
        });

        it('should enable queuing if autoQueue is set to true', function (done) {
          var kuzzle = new Kuzzle('nowhere', {autoQueue: true});
          this.timeout(200);

          setTimeout(function () {
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

          setTimeout(function () {
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

      describe('=> on reconnection', function () {
        beforeEach(function () {
          networkStub.onReconnect = function (cb) {
            setTimeout(function () { cb(); }, 0);
          };
        });

        it('should exit offline mode when reconnecting', function (done) {
          var
            kuzzle = new Kuzzle('nowhere'),
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
            kuzzle = new Kuzzle('nowhere'),
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
            kuzzle = new Kuzzle('nowhere', {autoResubscribe: false}),
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
            kuzzle = new Kuzzle('nowhere', {autoReplay: true});

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
            kuzzle = new Kuzzle('nowhere', {}),
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

    describe('#login', function () {
      var
        loginStub = function(strategy, credentials, expiresIn, cb) {
          if (typeof cb === 'function') {
            if (strategy === 'error') {
              cb(new Error());
            }
            else {
              cb(null);
            }
          }
        };

      beforeEach(function () {
        networkStub.onConnect = function (cb) {
          setTimeout(function () { cb(); }, 0);
        };

        networkStub.on = function (event, cb) {
          cb();
        };
      });

      it('should call the provided callback on a connection & login success', function (done) {
        var kuzzle;
        this.timeout(150);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual',
          loginStrategy: 'local',
          loginCredentials: {
            username: 'foo',
            password: 'bar'
          }
        }, function (err, res) {
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

        kuzzle.login = loginStub;
        kuzzle.connect();
      });


      it('should emit a connected event when connection & login success', function (done) {
        var
          kuzzle,
          listenerConnected = false;

        this.timeout(150);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual',
          loginStrategy: 'local',
          loginCredentials: {
            username: 'foo',
            password: 'bar'
          }
        }, function (err, res) {
          try {
            setTimeout(function () {
              should(err).be.null();
              should(res).be.instanceof(Kuzzle);
              should(res.state).be.exactly('connected');
              should(listenerConnected).be.exactly(true);
              done();
            }, 0);
          }
          catch (e) {
            done(e);
          }
        });

        kuzzle.login = loginStub;
        kuzzle.addListener('connected', function() {
          listenerConnected = true;
        });
        kuzzle.connect();
      });

      it('should send event discarded on network event discarded', function (done) {
        var
          kuzzle = new Kuzzle('nowhere', {
            connect: 'manual'
          });

        kuzzle.addListener('discarded', function () {
          done();
        });

        kuzzle.connect();
      });

      it('should have the token in login callback', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(null, {result: {jwt: 'test-toto'}});
        };

        kuzzle.login('local', loginCredentials, '1h', function() {
          should(kuzzle.jwtToken).be.exactly('test-toto');
          done();
        });
      });

      it('should handle login with only one argument and without callback', function (done) {
        var
          kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function() {
          done();
        };
        kuzzle.login('local');
      });

      it('should handle login with credentials and without callback', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function() {
          done();
        };

        kuzzle.login('local', loginCredentials);
      });

      it('should handle login without credentials, with expiresIn and without callback', function (done) {
        var
          kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function() {
          done();
        };

        kuzzle.login('local', '1h');
      });

      it('should handle login without credentials, without expiresIn and with callback', function (done) {
        var
          kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(null, {result: {jwt: 'test-toto'}});
        };

        kuzzle.login('local', '1h', function() {
          done();
        });
      });

      it('should handle login without credentials, without expiresIn and with callback', function (done) {
        var
          kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(null, {result: {jwt: 'test-toto'}});
        };

        kuzzle.login('local', function() {
          done();
        });
      });

      it('should handle login with credentials', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(null, {result: {jwt: 'test-toto'}});
        };

        kuzzle.login('local', loginCredentials, function() {
          done();
        });
      });

      it('should send a failed loginAttempt event if logging in fails', function (done) {
        var
          kuzzle = new Kuzzle('nowhere', {connect: 'manual'}),
          eventEmitted = false;

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb({message: 'foobar'});
        };

        kuzzle.addListener('loginAttempt', function (status) {
          should(status.success).be.false();
          should(status.error).be.eql('foobar');
          eventEmitted = true;
        });

        kuzzle.login('local', {});

        setTimeout(function () {
          should(eventEmitted).be.true();
          done();
        }, 0);
      });

      it('should not forward an event if there is no JWT token in the response', function (done) {
        var
          kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(null, {result: {}});
        };

        kuzzle.addListener('loginAttempt', function () {
          done('test failed');
        });

        kuzzle.login('local', {});

        setTimeout(function () {
          done();
        }, 0);
      });

      it('should handle optional arguments correctly', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query) {
          should(query.expiresIn).be.undefined();
          done();
        };

        kuzzle.login('local', loginCredentials, function () {});
      });

      it('should handle optional callback correctly', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query) {
          should(query.expiresIn).be.undefined();
          done();
        };

        kuzzle.login('local', loginCredentials);
      });

      it('should have a empty token in logout callback', function () {
        var
          unsetJwtToken = false,
          kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.unsetJwtToken = function() {
          unsetJwtToken = true;
        };

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(null, {});
        };

        kuzzle.logout(function () {});
        should(unsetJwtToken).be.exactly(true);
      });

      it('should give an error if login query fail to the logout callback if is set', function (done) {
        var
          kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(new Error());
        };

        kuzzle.logout(function(error) {
          should(error).be.an.instanceOf(Error);
          done();
        });
      });

      it('should give an error if login query fail to the login callback if is set', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(new Error());
        };

        try {
          kuzzle.login('local', loginCredentials, '1h', function(error) {
            should(error).be.an.instanceOf(Error);
            done();
          });
        }
        catch (err) {
          done(err);
        }
      });

      it('should be able to send a login request', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options) {
          should(queryArgs.action).be.exactly('login');
          should(queryArgs.controller).be.exactly('auth');
          should(query.body.username).be.exactly('foo');
          should(query.body.password).be.exactly('bar');
          should(query.body.expiresIn).be.exactly('1h');
          should(options.queuable).be.false();
          done();
        };

        kuzzle.login('local', loginCredentials, '1h');
      });

      it('should forward token when logged in', function () {
        var
          kuzzle,
          now = Date.now();

        this.timeout(200);

        Kuzzle = rewire(kuzzleSource);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.queuing = true;
        kuzzle.jwtToken = 'fake-token';

        kuzzle.query({collection: 'collection', controller: 'controller', action: 'action', index: 'index'}, {});

        should(kuzzle.offlineQueue.length).be.exactly(1);
        should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 200);
        should(kuzzle.offlineQueue[0].query.action).be.exactly('action');
        should(kuzzle.offlineQueue[0].query.controller).be.exactly('controller');
        should(kuzzle.offlineQueue[0].query.index).be.exactly('index');
        should(kuzzle.offlineQueue[0].query.jwt).be.exactly('fake-token');
      });
    });
  });
});
