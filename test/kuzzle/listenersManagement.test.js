const
  should = require('should'),
  sinon = require('sinon'),
  proxyquire = require('proxyquire'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock');

describe('Kuzzle listeners management', () => {
  const
    addListenerStub = sinon.stub(),
    emitStub = sinon.stub();

  let
    Kuzzle,
    kuzzle;

  before(() => {
    const KuzzleEventEmitterMock = function() {};

    KuzzleEventEmitterMock.prototype.addListener = addListenerStub;
    KuzzleEventEmitterMock.prototype.emit = emitStub;

    Kuzzle = proxyquire('../../src/Kuzzle', {
      './eventEmitter': KuzzleEventEmitterMock
    });
  });


  beforeEach(() => {
    const network = new NetworkWrapperMock();
    kuzzle = new Kuzzle(network, {eventTimeout: 20});
    addListenerStub.reset();
    emitStub.reset();
  });

  it('should only listen to allowed events', () => {
    const knownEvents = [
      'connected',
      'discarded',
      'disconnected',
      'loginAttempt',
      'networkError',
      'offlineQueuePush',
      'offlineQueuePop',
      'queryError',
      'reconnected',
      'tokenExpired'
    ];

    should(function() {kuzzle.addListener('foo', sinon.stub());}).throw('[foo] is not a known event. Known events: ' + knownEvents.toString());

    let i;
    for (i = 0; i < knownEvents.length; i++) {
      kuzzle.addListener(knownEvents[i], sinon.stub());
    }

    should(addListenerStub.callCount).be.exactly(10);
    for (i = 0; i < knownEvents.length; i++) {
      should(addListenerStub.getCall(i)).be.calledWith(knownEvents[i]);
    }
  });

  it('should not re-emit an event before event timeout', done => {

    kuzzle.emit('connected', 'foo');
    kuzzle.emit('connected', 'foo');
    kuzzle.emit('connected', 'foo');
    kuzzle.emit('connected', 'foo');
    kuzzle.emit('offlineQueuePush', 'bar');

    setTimeout(function () {
      should(emitStub).be.calledTwice();
      should(emitStub.firstCall).be.calledWith('connected', 'foo');
      should(emitStub.secondCall).be.calledWith('offlineQueuePush', 'bar');

      emitStub.reset();
      setTimeout(function () {
        kuzzle.emit('connected', 'bar');
        kuzzle.emit('connected', 'bar');

        setTimeout(function () {
          should(emitStub).be.calledOnce();
          should(emitStub).be.calledWith('connected', 'bar');
          done();
        }, 0);
      }, 30);
    }, 0);
  });

});
