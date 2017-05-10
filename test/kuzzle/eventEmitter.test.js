var
  should = require('should'),
  sinon = require('sinon'),
  KuzzleEventEmitter;

describe('Event emitter', function () {
  var
    kuzzleEventEmitter,
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

  // Force uncache `KuzzleEventEmitter` module to use it as in a browser mode:
  before(function () {
    window = 'foo'; // eslint-disable-line
    delete(require.cache[require.resolve('../../src/eventEmitter')]);
    KuzzleEventEmitter = require('../../src/eventEmitter');
  });

  after(function () {
    delete window; // eslint-disable-line
    delete(require.cache[require.resolve('../../src/eventEmitter')]);
  });

  beforeEach(function() {
    kuzzleEventEmitter = new KuzzleEventEmitter();
    stubListener1.reset();
    stubListener2.reset();
    stubListener3.reset();
  });

  describe('#addListener', function () {
    it('should properly add new listeners to events', function () {
      kuzzleEventEmitter.on('foo', listener1);
      kuzzleEventEmitter.on('foo', listener2);
      kuzzleEventEmitter.on('bar', listener3);
      should(kuzzleEventEmitter._events.foo.length).be.exactly(2);
      should(kuzzleEventEmitter._events.foo[0]).be.exactly(listener1);
      should(kuzzleEventEmitter._events.foo[1]).be.exactly(listener2);
      should(kuzzleEventEmitter._events.bar.length).be.exactly(1);
      should(kuzzleEventEmitter._events.bar[0]).be.exactly(listener3);
    });

    it('should throw an error when providing a non-function listener argument', function () {
      should(function () {
        kuzzleEventEmitter.on('foo', 'bar');
      }).throw();
    });

    it('should emit "newListener" event', function() {
      kuzzleEventEmitter.emit = sinon.stub();
      kuzzleEventEmitter.on('foo', listener1);
      should(kuzzleEventEmitter.emit).be.calledOnce();
      should(kuzzleEventEmitter.emit).be.calledWith('newListener', 'foo', listener1);
    });
  });

  describe('#prependListener', function () {
    it('should properly add new listeners to the top of the event list', function () {
      kuzzleEventEmitter.on('foo', listener1);
      kuzzleEventEmitter.on('foo', listener2);
      kuzzleEventEmitter.prependListener('foo', listener3);
      should(kuzzleEventEmitter._events.foo.length).be.exactly(3);
      should(kuzzleEventEmitter._events.foo[0]).be.exactly(listener3);
      should(kuzzleEventEmitter._events.foo[1]).be.exactly(listener1);
      should(kuzzleEventEmitter._events.foo[2]).be.exactly(listener2);
    });

    it('should emit "newListener" event', function() {
      kuzzleEventEmitter.emit = sinon.stub();
      kuzzleEventEmitter.prependListener('foo', listener1);
      should(kuzzleEventEmitter.emit).be.calledOnce();
      should(kuzzleEventEmitter.emit).be.calledWith('newListener', 'foo', listener1);
    });
  });

  describe('#once', function () {
    it('should call on() method', function () {
      kuzzleEventEmitter.on = sinon.stub();
      kuzzleEventEmitter.once('foo', listener1);
      should(kuzzleEventEmitter.on).be.calledOnce();
      should(kuzzleEventEmitter.on).be.calledWith('foo', listener1);
    });

    it('should properly add new listeners to once events', function () {
      kuzzleEventEmitter.once('foo', listener1);
      kuzzleEventEmitter.once('foo', listener2);
      kuzzleEventEmitter.on('foo', listener3);
      kuzzleEventEmitter.once('bar', listener3);

      should(kuzzleEventEmitter._onceEvents.foo[listener1]).be.true();
      should(kuzzleEventEmitter._onceEvents.foo[listener2]).be.true();
      should(kuzzleEventEmitter._onceEvents.foo[listener3]).be.undefined();
      should(kuzzleEventEmitter._onceEvents.bar[listener3]).be.true();
    });
  });

  describe('#prependOnceListener', function () {
    it('should call prependListener() method', function () {
      kuzzleEventEmitter.prependListener = sinon.stub();
      kuzzleEventEmitter.prependOnceListener('foo', listener1);
      should(kuzzleEventEmitter.prependListener).be.calledOnce();
      should(kuzzleEventEmitter.prependListener).be.calledWith('foo', listener1);
    });

    it('should properly add new listeners to once events', function () {
      kuzzleEventEmitter.prependOnceListener('foo', listener1);
      kuzzleEventEmitter.prependOnceListener('foo', listener2);
      kuzzleEventEmitter.prependListener('foo', listener3);
      kuzzleEventEmitter.prependOnceListener('bar', listener3);

      should(kuzzleEventEmitter._onceEvents.foo[listener1]).be.true();
      should(kuzzleEventEmitter._onceEvents.foo[listener2]).be.true();
      should(kuzzleEventEmitter._onceEvents.foo[listener3]).be.undefined();
      should(kuzzleEventEmitter._onceEvents.bar[listener3]).be.true();
    });
  });

  describe('#removeListener', function () {
    beforeEach(function () {
      kuzzleEventEmitter._events = {
        foo: [
          listener1,
          listener2,
          listener3
        ],
        bar: [
          listener1,
          listener2
        ],
        baz: [
          listener3
        ]
      };
    });

    it('should remove any one listener from the listener list', function () {
      kuzzleEventEmitter.removeListener('foo', listener2);
      should(kuzzleEventEmitter._events.foo.length).be.exactly(2);
      should(kuzzleEventEmitter._events.bar.length).be.exactly(2);
      should(kuzzleEventEmitter._events.baz.length).be.exactly(1);
    });

    it('should do nothing when trying to remove a listener from an unknown event', function () {
      kuzzleEventEmitter.removeListener('foobar', listener2);
      should(kuzzleEventEmitter._events.foo.length).be.exactly(3);
      should(kuzzleEventEmitter._events.bar.length).be.exactly(2);
      should(kuzzleEventEmitter._events.baz.length).be.exactly(1);
    });

    it('should do nothing if the provided listener does not exist', function () {
      kuzzleEventEmitter.removeListener('foobar', listener1);
      should(kuzzleEventEmitter._events.foo.length).be.exactly(3);
      should(kuzzleEventEmitter._events.bar.length).be.exactly(2);
      should(kuzzleEventEmitter._events.baz.length).be.exactly(1);
    });
  });

  describe('#removeAllListeners', function () {
    beforeEach(function () {
      kuzzleEventEmitter._events = {
        foo: [
          listener1,
          listener2,
          listener3
        ],
        bar: [
          listener1,
          listener2
        ],
        baz: [
          listener3
        ]
      };
    });

    it('should remove all registered listeners on a given event when asked to', function () {
      kuzzleEventEmitter.removeAllListeners('bar');

      should(kuzzleEventEmitter._events.foo.length).be.exactly(3);
      should(kuzzleEventEmitter._events.bar).be.undefined();
      should(kuzzleEventEmitter._events.baz.length).be.exactly(1);
    });

    it('should remove all registered listeners on all events when providing no event argument', function () {
      kuzzleEventEmitter.removeAllListeners();

      should(kuzzleEventEmitter._events.foo).be.undefined();
      should(kuzzleEventEmitter._events.bar).be.undefined();
      should(kuzzleEventEmitter._events.baz).be.undefined();
    });
  });

  describe('#emit', function () {
    it('should call all added listeners for a given event', function () {
      kuzzleEventEmitter._events = {
        foo: [
          listener1,
          listener1,
          listener2
        ]
      };

      kuzzleEventEmitter.emit('foo');
      should(stubListener1).be.calledTwice();
      should(stubListener2).be.calledOnce();
    });

    it('should call "once" listeners only once and othe ones each time the event is fired', function () {
      kuzzleEventEmitter._events = {
        foo: [
          listener1,
          listener2
        ]
      };
      kuzzleEventEmitter._onceEvents = {foo: {}};
      kuzzleEventEmitter._onceEvents.foo[listener1] = true;

      kuzzleEventEmitter.emit('foo');
      kuzzleEventEmitter.emit('foo');
      kuzzleEventEmitter.emit('foo');
      should(stubListener1).be.calledOnce();
      should(stubListener2).be.calledThrice();
    });

    it('should allow providing any number of arguments', function () {
      kuzzleEventEmitter._events = {
        foo: [
          listener1
        ]
      };

      kuzzleEventEmitter.emit('foo');
      should(stubListener1).be.calledOnce();
      should(stubListener1.firstCall.args).be.empty();

      stubListener1.reset();
      kuzzleEventEmitter.emit('foo', 'bar');
      should(stubListener1).be.calledOnce();
      should(stubListener1.firstCall.args).be.an.Array();
      should(stubListener1.firstCall.args).length(1);
      should(stubListener1.firstCall.args[0]).be.exactly('bar');

      stubListener1.reset();
      kuzzleEventEmitter.emit('foo', 'bar', ['foo', 'bar']);
      should(stubListener1).be.calledOnce();
      should(stubListener1.firstCall.args).be.an.Array();
      should(stubListener1.firstCall.args).length(2);
      should(stubListener1.firstCall.args[0]).be.exactly('bar');
      should(stubListener1.firstCall.args[1]).be.an.Array();
      should(stubListener1.firstCall.args[1]).match(['foo', 'bar']);

      stubListener1.reset();
      kuzzleEventEmitter.emit('foo', {foo: 'bar'}, 'bar', ['foo', 'bar']);
      should(stubListener1).be.calledOnce();
      should(stubListener1.firstCall.args).be.an.Array();
      should(stubListener1.firstCall.args).length(3);
      should(stubListener1.firstCall.args[0]).be.an.Object();
      should(stubListener1.firstCall.args[0].foo).be.exactly('bar');
      should(stubListener1.firstCall.args[1]).be.exactly('bar');
      should(stubListener1.firstCall.args[2]).be.an.Array();
      should(stubListener1.firstCall.args[2]).match(['foo', 'bar']);
    });
  });
});
