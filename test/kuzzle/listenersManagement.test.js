var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Listeners management', function () {
  var
    kuzzle,
    stublistener1,
    stublistener2,
    stublistener3,
    stublistener4,
    listenerIds;

  beforeEach(function () {
    stublistener1 = function () {};
    stublistener2 = function () {};
    stublistener3 = function () {};
    stublistener4 = function () {};

    kuzzle = new Kuzzle('foo', 'this is not an index');
    listenerIds = [];

    listenerIds.push(kuzzle.addListener('connected', stublistener1));
    listenerIds.push(kuzzle.addListener('connected', stublistener2));
    listenerIds.push(kuzzle.addListener('connected', stublistener3));
    listenerIds.push(kuzzle.addListener('connected', stublistener4));
    kuzzle.addListener('kerror', stublistener1);
    kuzzle.addListener('kerror', stublistener2);
    kuzzle.addListener('kerror', stublistener3);
    kuzzle.addListener('disconnected', stublistener1);
    kuzzle.addListener('disconnected', stublistener2);
    kuzzle.addListener('reconnected', stublistener3);
  });

  describe('#addListener', function () {
    it('should properly add new listeners to events', function () {
      should(kuzzle.listeners('connected').length).be.exactly(4);
      should(kuzzle.listeners('kerror').length).be.exactly(3);
      should(kuzzle.listeners('disconnected').length).be.exactly(2);
      should(kuzzle.listeners('reconnected').length).be.exactly(1);
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

      should(kuzzle.listeners('connected').length).be.exactly(4);
      should(kuzzle.listeners('kerror').length).be.exactly(3);
      should(kuzzle.listeners('disconnected').length).be.exactly(0);
      should(kuzzle.listeners('reconnected').length).be.exactly(1);
    });

    it('should remove all registered listeners on all events when providing no event argument', function () {
      kuzzle.removeAllListeners();

      should(kuzzle.listeners('connected').length).be.exactly(0);
      should(kuzzle.listeners('kerror').length).be.exactly(0);
      should(kuzzle.listeners('disconnected').length).be.exactly(0);
      should(kuzzle.listeners('reconnected').length).be.exactly(0);
    });

    it('should throw an error when an unknown event is provided', function () {
      try {
        kuzzle.removeAllListeners('foo');
        should.fail('success', 'failure', 'Should have failed removing listeners with an unknown event', '');
      }
      catch (e) {
        should(kuzzle.listeners('connected').length).be.exactly(4);
        should(kuzzle.listeners('kerror').length).be.exactly(3);
        should(kuzzle.listeners('disconnected').length).be.exactly(2);
        should(kuzzle.listeners('reconnected').length).be.exactly(1);
      }
    });
  });

  describe('#removeListener', function () {
    it('should remove any one listener from the listener list', function () {
      kuzzle.removeListener('connected', stublistener2);
      should(kuzzle.listeners('connected').length).be.exactly(3);
      should(kuzzle.listeners('kerror').length).be.exactly(3);
      should(kuzzle.listeners('disconnected').length).be.exactly(2);
      should(kuzzle.listeners('reconnected').length).be.exactly(1);
    });

    it('should throw an error when trying to remove a listener from an unknown event', function () {
      try {
        kuzzle.removeListener('foo', function() {});
        should.fail('success', 'failure', 'Should have failed removing listeners with an unknown event', '');
      }
      catch (e) {
        should(kuzzle.listeners('connected').length).be.exactly(4);
        should(kuzzle.listeners('kerror').length).be.exactly(3);
        should(kuzzle.listeners('disconnected').length).be.exactly(2);
        should(kuzzle.listeners('reconnected').length).be.exactly(1);
      }
    });

    it('should do nothing if the provided listener id does not exist', function () {
      kuzzle.removeListener('connected', function() {});
      should(kuzzle.listeners('connected').length).be.exactly(4);
      should(kuzzle.listeners('kerror').length).be.exactly(3);
      should(kuzzle.listeners('disconnected').length).be.exactly(2);
      should(kuzzle.listeners('reconnected').length).be.exactly(1);
    });
  });
});
