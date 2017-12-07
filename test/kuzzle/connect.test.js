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

  it('should return the current Kuzzle instance', function () {
    var
      kuzzle = new Kuzzle('somewhere', {connect: 'manual'}),
      connectedKuzzle = kuzzle.connect();

    should(connectedKuzzle).be.exactly(kuzzle);
  });

  it('should return immediately if already connected', function () {
    var promises = [];
    ['connecting', 'connected'].forEach(function (state) {
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
    return Promise.all(promises);
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

    it('should keep a valid JWT at reconnection', function () {
      var kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'});

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
        kuzzle = new Kuzzle('somewhereagain', {connect: 'manual'});

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
        kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function() {
          kuzzle.network.disconnect();
        });

      kuzzle.addListener('disconnected', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });

    it('should register listeners upon receiving a "discarded" event', function () {
      var
        eventStub = sinon.stub(),
        kuzzle = new Kuzzle('somewhere', {connect: 'manual'}, function() {
          kuzzle.network.emit('discarded');
        });

      kuzzle.addListener('discarded', eventStub);

      kuzzle.connect();
      clock.tick();
      should(eventStub).be.calledOnce();
    });
  });
});
