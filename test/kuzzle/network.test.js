var
  should = require('should'),
  proxyquire = require('proxyquire'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock');

describe('Kuzzle network methods', function () {
  var 
    Kuzzle,
    kuzzle;

  beforeEach(function () {
    Kuzzle = proxyquire('../../src/Kuzzle', {
      './networkWrapper': function(protocol, host, options) {
        return new NetworkWrapperMock(host, options);
      }
    });

    kuzzle = new Kuzzle('somewhere', {connect: 'manual'});
    kuzzle.network.close = sinon.stub();
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
      kuzzle.network.emit('queryError', error, query);

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({message: 'foo-bar'}, {foo: 'bar'});
    });

    it('should propagate network "offlineQueuePush" events', function () {
      var eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePush', eventStub);
      kuzzle.network.emit('offlineQueuePush', {query: {foo: 'bar'}, cb: 'callback'});

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({query: {foo: 'bar'}, cb: 'callback'});
    });

    it('should propagate network "offlineQueuePop" events', function () {
      var eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePop', eventStub);
      kuzzle.network.emit('offlineQueuePop', {foo: 'bar'});

      should(eventStub).be.calledOnce();
      should(eventStub).be.calledWithMatch({foo: 'bar'});
    });

    it('should propagate network "tokenExpired" events', function () {
      var eventStub = sinon.stub();

      kuzzle.addListener('tokenExpired', eventStub);
      kuzzle.network.emit('tokenExpired');

      should(eventStub).be.calledOnce();
    });

    it('should empty the jwt when a "tokenExpired" events is triggered', function () {
      kuzzle.jwt = 'foobar';
      kuzzle.network.emit('tokenExpired');

      should(kuzzle.jwt).be.undefined();
    });
  });
});
