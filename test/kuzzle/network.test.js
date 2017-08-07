var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Kuzzle network methods', function () {
  var kuzzle;

  beforeEach(function () {
    networkWrapperRevert = Kuzzle.__set__({
      networkWrapper: function(protocol, host, options) {
        return new NetworkWrapperMock(host, options);
      }
    });

    kuzzle = new Kuzzle('somewhere', {connect: 'manual'});
    kuzzle.network.close = sinon.stub();
  });

  afterEach(function() {
    networkWrapperRevert();
  });

  describe('#flushQueue', function() {
    it('should return Kuzzle instance', function () {
      var result = kuzzle.flushQueue();
      should(result).be.exactly(kuzzle);
    });

    it('should call network flushQueue method', function () {
      kuzzle.flushQueue();
      should(kuzzle.network.flushQueue).be.calledOnce();
    });
  });

  describe('#playQueue', function() {
    it('should return Kuzzle instance', function () {
      var result = kuzzle.playQueue();
      should(result).be.exactly(kuzzle);
    });

    it('should call network playQueue method', function () {
      kuzzle.playQueue();
      should(kuzzle.network.playQueue).be.calledOnce();
    });
  });

  describe('#startQueuing', function() {
    it('should return Kuzzle instance', function () {
      var result = kuzzle.startQueuing();
      should(result).be.exactly(kuzzle);
    });

    it('should call network startQueuing method', function () {
      kuzzle.startQueuing();
      should(kuzzle.network.startQueuing).be.calledOnce();
    });
  });

  describe('#stopQueuing', function() {
    it('should return Kuzzle instance', function () {
      var result = kuzzle.stopQueuing();
      should(result).be.exactly(kuzzle);
    });

    it('should call network stopQueuing method', function () {
      kuzzle.stopQueuing();
      should(kuzzle.network.stopQueuing).be.calledOnce();
    });
  });

  describe('#disconnect', function() {
    it('should close network connection', function () {
      kuzzle.disconnect();
      should(kuzzle.network.close).be.calledOnce();
    });

    it('should correctly invalidate kuzzle instance', function () {
      kuzzle.collections = {foo: 'bar', baz: 'yolo'};
      kuzzle.disconnect();
      should(kuzzle.collections).be.empty();
    });
  });

  describe('#events', function() {
    it('should propagate network "queryError" events', function () {
      var
        eventStub = sinon.stub(),
        error = {message: 'foo-bar'},
        query = {foo: 'bar'};

      kuzzle.addListener('queryError', eventStub);
      kuzzle.network.emitEvent('queryError', error, query);

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({message: 'foo-bar'}, {foo: 'bar'});
    });

    it('should propagate network "offlineQueuePush" events', function () {
      var eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePush', eventStub);
      kuzzle.network.emitEvent('offlineQueuePush', {query: {foo: 'bar'}, cb: 'callback'});

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({query: {foo: 'bar'}, cb: 'callback'});
    });

    it('should propagate network "offlineQueuePop" events', function () {
      var eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePop', eventStub);
      kuzzle.network.emitEvent('offlineQueuePop', {foo: 'bar'});

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({foo: 'bar'});
    });

    it('should propagate network "tokenExpired" events', function () {
      var eventStub = sinon.stub();

      kuzzle.addListener('tokenExpired', eventStub);
      kuzzle.network.emitEvent('tokenExpired');

      should(eventStub).be.calledOnce();
    });

    it('should empty the jwt when a "tokenExpired" events is triggered', function () {
      kuzzle.jwtToken = 'foobar';
      kuzzle.network.emitEvent('tokenExpired');

      should(kuzzle.jwtToken).be.undefined();
    });

    it('should populate the request History when a "emitRequest" events is triggered', function () {
      var
        now = Date.now(),
        request = {requestId: 'foobar', query: {foo: 'bar'}};

      kuzzle.requestHistory = {};

      kuzzle.network.emitEvent('emitRequest', request);
      should(kuzzle.requestHistory.foobar).not.be.undefined().and.be.approximately(now, 10);
    });
  });
});
