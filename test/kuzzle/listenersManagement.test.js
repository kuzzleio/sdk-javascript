var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Listeners management', function () {
  var
    kuzzle,
    listenerIds;

  beforeEach(function () {
    var stublistener = function () {};

    kuzzle = new Kuzzle('foo', 'this is not an index');
    listenerIds = [];

    listenerIds.push(kuzzle.addListener('connected', stublistener));
    listenerIds.push(kuzzle.addListener('connected', stublistener));
    listenerIds.push(kuzzle.addListener('connected', stublistener));
    listenerIds.push(kuzzle.addListener('connected', stublistener));
    kuzzle.addListener('error', stublistener);
    kuzzle.addListener('error', stublistener);
    kuzzle.addListener('error', stublistener);
    kuzzle.addListener('disconnected', stublistener);
    kuzzle.addListener('disconnected', stublistener);
    kuzzle.addListener('reconnected', stublistener);
  });

  describe('#addListener', function () {
    it('should properly add new listeners to events', function () {
      should(kuzzle.eventEmitter.eventListeners.connected.listeners.length).be.exactly(4);
      should(kuzzle.eventEmitter.eventListeners.error.listeners.length).be.exactly(3);
      should(kuzzle.eventEmitter.eventListeners.disconnected.listeners.length).be.exactly(2);
      should(kuzzle.eventEmitter.eventListeners.reconnected.listeners.length).be.exactly(1);
    });

    it('should throw an error if trying to adding a listener to an unknown event', function () {
      should(function () {
        kuzzle.addListener('foo', function () {});
      }).throw();
    });

    it('should throw an error when providing a non-function listener argument', function () {
      should(function () {
        kuzzle.addListener('connected', 'bar');
      }).throw();
    });
  });

  describe('#removeAllListeners', function () {
    it('should remove all registered listeners on a given event when asked to', function () {
      kuzzle.removeAllListeners('disconnected');

      should(kuzzle.eventEmitter.eventListeners.connected.listeners.length).be.exactly(4);
      should(kuzzle.eventEmitter.eventListeners.error.listeners.length).be.exactly(3);
      should(kuzzle.eventEmitter.eventListeners.disconnected).be.undefined();
      should(kuzzle.eventEmitter.eventListeners.reconnected.listeners.length).be.exactly(1);
    });

    it('should remove all registered listeners on all events when providing no event argument', function () {
      kuzzle.removeAllListeners();

      should(kuzzle.eventEmitter.eventListeners.connected).be.undefined();
      should(kuzzle.eventEmitter.eventListeners.error).be.undefined();
      should(kuzzle.eventEmitter.eventListeners.disconnected).be.undefined();
      should(kuzzle.eventEmitter.eventListeners.reconnected).be.undefined();
    });

    it('should throw an error when an unknown event is provided', function () {
      try {
        kuzzle.removeAllListeners('foo');
        should.fail('success', 'failure', 'Should have failed removing listeners with an unknown event', '');
      }
      catch (e) {
        should(kuzzle.eventEmitter.eventListeners.connected.listeners.length).be.exactly(4);
        should(kuzzle.eventEmitter.eventListeners.error.listeners.length).be.exactly(3);
        should(kuzzle.eventEmitter.eventListeners.disconnected.listeners.length).be.exactly(2);
        should(kuzzle.eventEmitter.eventListeners.reconnected.listeners.length).be.exactly(1);
      }
    });
  });

  describe('#removeListener', function () {
    it('should remove any one listener from the listener list', function () {
      var listener = kuzzle.eventEmitter.eventListeners.connected.listeners.filter(function (l) {
        return l.id === listenerIds[2];
      });

      should(listener.length).be.exactly(1);
      kuzzle.removeListener('connected', listenerIds[2]);
      listener = kuzzle.eventEmitter.eventListeners.connected.listeners.filter(function (l) {
        return l.id === listenerIds[2];
      });
      should(listener.length).be.exactly(0);
      should(kuzzle.eventEmitter.eventListeners.connected.listeners.length).be.exactly(3);
      should(kuzzle.eventEmitter.eventListeners.error.listeners.length).be.exactly(3);
      should(kuzzle.eventEmitter.eventListeners.disconnected.listeners.length).be.exactly(2);
      should(kuzzle.eventEmitter.eventListeners.reconnected.listeners.length).be.exactly(1);
    });

    it('should throw an error when trying to remove a listener from an unknown event', function () {
      try {
        kuzzle.removeListener('foo', 'bar');
        should.fail('success', 'failure', 'Should have failed removing listeners with an unknown event', '');
      }
      catch (e) {
        should(kuzzle.eventEmitter.eventListeners.connected.listeners.length).be.exactly(4);
        should(kuzzle.eventEmitter.eventListeners.error.listeners.length).be.exactly(3);
        should(kuzzle.eventEmitter.eventListeners.disconnected.listeners.length).be.exactly(2);
        should(kuzzle.eventEmitter.eventListeners.reconnected.listeners.length).be.exactly(1);
      }
    });

    it('should do nothing if the provided listener id does not exist', function () {
      kuzzle.removeListener('connected', 'foo');
      should(kuzzle.eventEmitter.eventListeners.connected.listeners.length).be.exactly(4);
      should(kuzzle.eventEmitter.eventListeners.error.listeners.length).be.exactly(3);
      should(kuzzle.eventEmitter.eventListeners.disconnected.listeners.length).be.exactly(2);
      should(kuzzle.eventEmitter.eventListeners.reconnected.listeners.length).be.exactly(1);
    });
  });
});
