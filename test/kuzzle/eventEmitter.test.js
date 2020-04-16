const
  should = require('should'),
  sinon = require('sinon'),
  KuzzleEventEmitter = require('../../src/core/KuzzleEventEmitter');

describe('Event emitter', () => {
  const
    stubListener1 = sinon.stub(),
    stubListener2 = sinon.stub(),
    stubListener3 = sinon.stub(),
    listener1 = function() {
      stubListener1.apply(this, arguments);
    },
    listener2 = function() {
      stubListener2.apply(this, arguments);
    },
    listener3 = function() {
      stubListener3.apply(this, arguments);
    };

  let kuzzleEventEmitter;

  beforeEach(() => {
    kuzzleEventEmitter = new KuzzleEventEmitter();
    stubListener1.reset();
    stubListener2.reset();
    stubListener3.reset();
  });

  describe('#addListener', () => {
    it('should properly add new listeners to events', () => {
      should(kuzzleEventEmitter.on('foo', listener1)).be.eql(kuzzleEventEmitter);
      should(kuzzleEventEmitter.on('foo', listener2)).be.eql(kuzzleEventEmitter);
      should(kuzzleEventEmitter.on('bar', listener3)).be.eql(kuzzleEventEmitter);
      should(kuzzleEventEmitter.listeners('foo')).eql([listener1, listener2]).and.have.length(2);
      should(kuzzleEventEmitter.listeners('bar')).eql([listener3]).and.have.length(1);
    });

    it('should throw an error when providing a non-function listener argument', () => {
      should(function () {
        kuzzleEventEmitter.on('foo', 'bar');
      }).throw();
    });

    it('should not add a duplicate listener', () => {
      should(kuzzleEventEmitter.on('foo', listener1));
      should(kuzzleEventEmitter.on('foo', listener1));
      should(kuzzleEventEmitter.listeners('foo')).eql([listener1]).and.have.length(1);
    });
  });

  describe('#prependListener', () => {
    it('should properly add new listeners to the top of the event list', () => {
      kuzzleEventEmitter.prependListener('foo', listener1);
      kuzzleEventEmitter.prependListener('foo', listener2);
      kuzzleEventEmitter.prependListener('foo', listener3);
      should(kuzzleEventEmitter.listeners('foo')).eql([listener3, listener2, listener1]).and.have.length(3);
    });
  });

  describe('#once', () => {
    it('should register listeners only for 1 time', () => {
      kuzzleEventEmitter.on('foo', listener1);
      kuzzleEventEmitter.on('foo', listener2);
      kuzzleEventEmitter.once('foo', listener3);

      should(kuzzleEventEmitter.listeners('foo')).eql([listener1, listener2, listener3]).and.have.length(3);

      kuzzleEventEmitter.emit('foo');

      should(stubListener1).be.calledOnce();
      should(stubListener2).be.calledOnce();
      should(stubListener3).be.calledOnce();

      should(kuzzleEventEmitter.listeners('foo')).eql([listener1, listener2]).and.have.length(2);
    });
  });

  describe('#prependOnceListener', () => {
    it('should prepend listeners only for 1 time', () => {
      kuzzleEventEmitter.on('foo', listener1);
      kuzzleEventEmitter.on('foo', listener2);
      kuzzleEventEmitter.prependOnceListener('foo', listener3);

      should(kuzzleEventEmitter.listeners('foo')).eql([listener3, listener1, listener2]).and.have.length(3);

      kuzzleEventEmitter.emit('foo');

      should(stubListener1).be.calledOnce();
      should(stubListener2).be.calledOnce();
      should(stubListener3).be.calledOnce();

      should(kuzzleEventEmitter.listeners('foo')).eql([listener1, listener2]).and.have.length(2);
    });
  });

  describe('#removeListener', () => {
    beforeEach(() => {
      kuzzleEventEmitter.addListener('foo', listener1);
      kuzzleEventEmitter.addListener('foo', listener2);
      kuzzleEventEmitter.addListener('foo', listener3);

      kuzzleEventEmitter.addListener('bar', listener1);
      kuzzleEventEmitter.addListener('bar', listener2);

      kuzzleEventEmitter.addListener('baz', listener3);
    });

    it('should remove any one listener from the listener list', () => {
      kuzzleEventEmitter.removeListener('foo', listener2);

      should(kuzzleEventEmitter.listeners('foo')).eql([listener1, listener3]).and.have.length(2);
      should(kuzzleEventEmitter.listeners('bar')).eql([listener1, listener2]).and.have.length(2);
      should(kuzzleEventEmitter.listeners('baz')).eql([listener3]).and.have.length(1);
    });

    it('should do nothing when trying to remove a listener from an unknown event', () => {
      kuzzleEventEmitter.removeListener('foobar', listener2);

      should(kuzzleEventEmitter.listeners('foo')).eql([listener1, listener2, listener3]).and.have.length(3);
      should(kuzzleEventEmitter.listeners('bar')).eql([listener1, listener2]).and.have.length(2);
      should(kuzzleEventEmitter.listeners('baz')).eql([listener3]).and.have.length(1);
    });

    it('should do nothing if the provided listener does not exist', () => {
      kuzzleEventEmitter.removeListener('bar', listener3);
      should(kuzzleEventEmitter.listeners('foo')).eql([listener1, listener2, listener3]).and.have.length(3);
      should(kuzzleEventEmitter.listeners('bar')).eql([listener1, listener2]).and.have.length(2);
      should(kuzzleEventEmitter.listeners('baz')).eql([listener3]).and.have.length(1);
    });
  });

  describe('#removeAllListeners', () => {
    beforeEach(() => {
      kuzzleEventEmitter.addListener('foo', listener1);
      kuzzleEventEmitter.addListener('foo', listener2);
      kuzzleEventEmitter.addListener('foo', listener3);

      kuzzleEventEmitter.addListener('bar', listener1);
      kuzzleEventEmitter.addListener('bar', listener2);

      kuzzleEventEmitter.addListener('baz', listener3);
    });

    it('should remove all registered listeners on a given event when asked to', () => {
      kuzzleEventEmitter.removeAllListeners('bar');

      should(kuzzleEventEmitter.listeners('foo')).eql([listener1, listener2, listener3]).and.have.length(3);
      should(kuzzleEventEmitter.listeners('bar')).eql([]).and.have.length(0);
      should(kuzzleEventEmitter.listeners('baz')).eql([listener3]).and.have.length(1);
    });

    it('should remove all registered listeners on all events when providing no event argument', () => {
      kuzzleEventEmitter.removeAllListeners();

      should(kuzzleEventEmitter.listeners('foo')).eql([]).and.have.length(0);
      should(kuzzleEventEmitter.listeners('bar')).eql([]).and.have.length(0);
      should(kuzzleEventEmitter.listeners('baz')).eql([]).and.have.length(0);
    });
  });

  describe('#emit', () => {
    it('should call all added listeners for a given event', () => {
      kuzzleEventEmitter.addListener('foo', listener1);
      kuzzleEventEmitter.addListener('foo', listener2);
      kuzzleEventEmitter.addListener('bar', listener2);

      kuzzleEventEmitter.emit('foo');
      should(stubListener1).be.calledOnce();
      should(stubListener2).be.calledOnce();
      should(stubListener3).not.be.called();
    });

    it('should call "once" listeners only once and othe ones each time the event is fired', () => {
      kuzzleEventEmitter.addOnceListener('foo', listener1);
      kuzzleEventEmitter.addListener('foo', listener2);

      kuzzleEventEmitter.emit('foo');
      kuzzleEventEmitter.emit('foo');
      kuzzleEventEmitter.emit('foo');
      should(stubListener1).be.calledOnce();
      should(stubListener2).be.calledThrice();
    });

    it('should allow providing any number of arguments', () => {
      kuzzleEventEmitter.addListener('foo', listener1);

      kuzzleEventEmitter.emit('foo');
      should(stubListener1).be.calledOnce();
      should(stubListener1.firstCall.args).be.empty();

      stubListener1.reset();
      kuzzleEventEmitter.emit('foo', 'bar');
      should(stubListener1).be.calledOnce();
      should(stubListener1.firstCall.args).eql(['bar']).and.have.length(1);

      stubListener1.reset();
      kuzzleEventEmitter.emit('foo', 'bar', ['foo', 'bar']);
      should(stubListener1).be.calledOnce();
      should(stubListener1.firstCall.args).eql(['bar', ['foo', 'bar']]).and.have.length(2);

      stubListener1.reset();
      kuzzleEventEmitter.emit('foo', {foo: 'bar'}, 'bar', ['foo', 'bar']);
      should(stubListener1.firstCall.args).eql([{foo: 'bar'}, 'bar', ['foo', 'bar']]).and.have.length(3);
    });
  });

  describe('#eventNames', () => {
    it('should return the list of registered event names', () => {
      should(kuzzleEventEmitter.on('foo', listener1)).be.eql(kuzzleEventEmitter);
      should(kuzzleEventEmitter.once('bar', listener2)).be.eql(kuzzleEventEmitter);
      should(kuzzleEventEmitter.on('baz', listener3)).be.eql(kuzzleEventEmitter);

      should(kuzzleEventEmitter.eventNames()).be.eql(['foo', 'bar', 'baz']);
    });
  });

  describe('#listenerCount', () => {
    it('should return the number of listeners on a given event', () => {
      kuzzleEventEmitter.on('foo', listener1);
      kuzzleEventEmitter.once('foo', listener2);
      kuzzleEventEmitter.on('bar', listener3);

      should(kuzzleEventEmitter.listenerCount('foo')).be.eql(2);
      should(kuzzleEventEmitter.listenerCount('bar')).be.eql(1);
      should(kuzzleEventEmitter.listenerCount('baz')).be.eql(0);
      should(kuzzleEventEmitter.listenerCount()).be.eql(0);
    });
  });
});
