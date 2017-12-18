var
  should = require('should'),
  sinon = require('sinon'),
  proxyquire = require('proxyquire');

describe('Kuzzle listeners management', function () {
  var
    Kuzzle,
    addListenerStub = sinon.stub(),
    emitStub = sinon.stub(),
    kuzzle;

  before(function () {
    var KuzzleEventEmitterMock = function() {};

    KuzzleEventEmitterMock.prototype.addListener = addListenerStub;
    KuzzleEventEmitterMock.prototype.emit = emitStub;

    Kuzzle = proxyquire('../../src/Kuzzle', {
      './eventEmitter': KuzzleEventEmitterMock
    });
  });


  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {eventTimeout: 20});
    addListenerStub.reset();
    emitStub.reset();
  });

  it('should only listen to allowed events', function() {
    var
      i,
      knownEvents = [
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
    for (i = 0; i < knownEvents.length; i++) {
      kuzzle.addListener(knownEvents[i], sinon.stub());
    }

    should(addListenerStub.callCount).be.exactly(10);
    for (i = 0; i < knownEvents.length; i++) {
      should(addListenerStub.getCall(i)).be.calledWith(knownEvents[i]);
    }
  });

  it('should not re-emit an event before event timeout', function (done) {

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
