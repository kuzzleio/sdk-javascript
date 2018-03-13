var
  should = require('should'),
  sinon = require('sinon'),
  proxyquire = require('proxyquire'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock');

describe('Kuzzle connect', function () {
  var
    Kuzzle,
    clock;

  beforeEach(function () {
    Kuzzle = proxyquire('../../src/Kuzzle', {
      './networkWrapper': function(protocol, host, options) {
        return new NetworkWrapperMock(host, options);
      }
    });

    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  it('should return immediately if already connected', function (done) {
    var kuzzle = new Kuzzle('somewhere');
    kuzzle.network.isReady.returns(true);
    kuzzle.connect(function (err, res) {
      should(err).be.null();
      should(res).be.exactly(kuzzle);
      should(res.network.connectCalled).be.false();
      done();
    });
    clock.tick();
  });

  it('should call network wrapper connect() method when the instance is offline', function (done) {
    var kuzzle = new Kuzzle('somewhere');
    kuzzle.network.isReady.returns(false);
    kuzzle.connect(function (err, res) {
      should(err).be.null();
      should(res).be.exactly(kuzzle);
      should(res.network.connectCalled).be.true();
      done();
    });
    clock.tick();
  });

  describe('=> Connection Events', function () {
    it('should registered listeners upon receiving a "error" event', function () {
      var
        kuzzle = new Kuzzle('nowhere'),
        eventStub = sinon.stub();

      kuzzle.addListener('networkError', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should registered listeners upon receiving a "connect" event', function () {
      var
        kuzzle = new Kuzzle('somewhere'),
        eventStub = sinon.stub();

      kuzzle.addListener('connected', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should registered listeners upon receiving a "reconnect" event', function () {
      var
        kuzzle = new Kuzzle('somewhereagain'),
        eventStub = sinon.stub();

      kuzzle.addListener('reconnected', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should keep a valid JWT at reconnection', function () {
      var kuzzle = new Kuzzle('somewhereagain');

      kuzzle.checkToken = sinon.stub();

      kuzzle.jwt = 'foobar';

      kuzzle.connect();
      clock.tick();

      should(kuzzle.checkToken).be.calledOnce();
      should(kuzzle.checkToken).be.calledWith('foobar');
      kuzzle.checkToken.yield(null, {valid: true});

      should(kuzzle.jwt).be.eql('foobar');
    });

    it('should empty the JWT at reconnection if it has expired', function () {
      var
        kuzzle = new Kuzzle('somewhereagain');

      kuzzle.checkToken = sinon.stub();

      kuzzle.jwt = 'foobar';

      kuzzle.connect();
      clock.tick();

      should(kuzzle.checkToken).be.calledOnce();
      should(kuzzle.checkToken).be.calledWith('foobar');
      kuzzle.checkToken.yield(null, {valid: false});

      should(kuzzle.jwt).be.undefined();
    });

    it('should register listeners upon receiving a "disconnect" event', function () {
      var
        eventStub = sinon.stub(),
        kuzzle = new Kuzzle('somewhere');

      kuzzle.addListener('disconnected', eventStub);

      kuzzle.connect(function () {
        kuzzle.network.disconnect();
      });
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should register listeners upon receiving a "discarded" event', function () {
      var
        eventStub = sinon.stub(),
        kuzzle = new Kuzzle('somewhere');

      kuzzle.addListener('discarded', eventStub);

      kuzzle.connect(function() {
        kuzzle.network.emit('discarded');
      });
      clock.tick();
      should(eventStub).be.calledOnce();
    });
  });
});
