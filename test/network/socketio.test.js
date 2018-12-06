const
  should = require('should'),
  sinon = require('sinon'),
  SocketIO = require('../../src/networkWrapper/protocols/socketio');

/**
 * @global window
 */

describe('SocketIO networking module', () => {
  let
    clock,
    socketIO,
    socketStub;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    socketStub = {
      events: {},
      eventOnce: {},
      once: function(evt, cb) {
        socketStub.eventOnce[evt] = socketStub.eventOnce[evt] || [];
        socketStub.eventOnce[evt].push(cb);
      },
      on: function(evt, cb) {
        socketStub.events[evt] = socketStub.events[evt] || [];
        socketStub.events[evt].push(cb);
      },
      off: function(evt, cb) {
        let i;

        if (typeof cb === 'undefined') {
          delete socketStub.eventOnce[evt];
          delete socketStub.events[evt];
        }
        else {
          i = socketStub.eventOnce[evt].indexOf(cb);
          if (i > -1) {
            delete socketStub.eventOnce[evt][i];
          }

          i = socketStub.events[evt].indexOf(cb);
          if (i > -1) {
            delete socketStub.events[evt][i];
          }
        }
      },
      emit: function(...args) {
        const evt = args.shift();

        if (socketStub.eventOnce[evt]) {
          for (const i in socketStub.eventOnce[evt]) {
            if (typeof socketStub.eventOnce[evt][i] === 'function') {
              socketStub.eventOnce[evt][i].apply(socketIO, args);
              delete socketStub.eventOnce[evt][i];
            }
          }
        }
        if (socketStub.events[evt]) {
          for (const i in socketStub.events[evt]) {
            if (typeof socketStub.events[evt][i] === 'function') {
              socketStub.events[evt][i].apply(socketIO, args);
            }
          }
        }
      },
      close: sinon.spy()
    };

    socketIO = new SocketIO({
      host: 'address',
      port: 1234,
      autoReconnect: false,
      reconnectionDelay: 1234
    });
    socketIO.socket = socketStub;

    window = {io: sinon.stub().returns(socketStub)}; // eslint-disable-line
  });

  afterEach(() => {
    clock.restore();
  });

  it('should expose an unique identifier', () => {
    should(socketIO.id).be.a.String();
  });

  it('should initialize network status when connecting', () => {
    socketIO.connect();
    should(socketIO.state).be.eql('connecting');
  });

  it('should connect with the right parameters', () => {
    socketIO.connect();
    should(window.io).be.calledOnce();
    should(window.io).be.calledWithMatch('http://address:1234', {
      reconnection: false,
      reconnectionDelay: 1234,
      forceNew: true
    });
  });

  it('should connect with the secure connection', () => {
    socketIO = new SocketIO({
      host: 'address',
      port: 1234,
      autoReconnect: false,
      reconnectionDelay: 1234,
      sslConnection: true
    });
    socketIO.socket = socketStub;

    socketIO.connect();
    should(window.io).be.calledWithMatch('https://address:1234', {
      reconnection: false,
      reconnectionDelay: 1234,
      forceNew: true
    });
  });

  it('should call listeners on connect event', () => {
    const cb = sinon.stub();

    should(socketIO.listeners('connect').length).be.eql(0);
    should(socketIO.listeners('reconnect').length).be.eql(0);

    socketIO.retrying = false;
    socketIO.addListener('connect', cb);
    // should(socketIO.listeners('connect').length).be.eql(1);
    // should(socketIO.listeners('reconnect').length).be.eql(0);

    socketIO.connect();
    socketIO.socket.emit('connect');

    should(cb).be.calledOnce();
  });

  it('should change the state when the client connection is established', () => {
    socketIO.state = 'connecting';
    socketIO.queuing = true;

    socketIO.connect();
    socketIO.socket.emit('connect');
    should(socketIO.state).be.eql('connected');
    should(socketIO.wasConnected).be.true();
    should(socketIO.stopRetryingToConnect).be.false();
  });

  it('should call listeners on a "reconnect" event', () => {
    const cb = sinon.stub();

    should(socketIO.listeners('connect').length).be.eql(0);
    should(socketIO.listeners('reconnect').length).be.eql(0);

    socketIO.wasConnected = true;
    socketIO.retrying = false;
    socketIO.addListener('reconnect', cb);
    should(socketIO.listeners('connect').length).be.eql(0);
    should(socketIO.listeners('reconnect').length).be.eql(1);

    socketIO.connect();
    socketIO.socket.emit('connect');

    should(cb).be.calledOnce();
  });

  it('should call listeners on a "disconnect" event', () => {
    const cb = sinon.stub();

    should(socketIO.listeners('disconnect').length).be.eql(0);

    socketIO.forceDisconnect = true;
    socketIO.addListener('disconnect', cb);
    should(socketIO.listeners('disconnect').length).be.eql(1);

    socketIO.connect();
    socketIO.socket.emit('disconnect');

    should(cb).be.calledOnce();
  });

  it('should call listeners on a connect error event', () => {
    const
      cb = sinon.stub(),
      err = new Error('foobar');

    should(socketIO.listeners('networkError').length).be.eql(0);

    socketIO.forceDisconnect = true;
    socketIO.addListener('networkError', cb);
    should(socketIO.listeners('networkError').length).be.eql(1);

    const promise = socketIO.connect();
    socketIO.socket.emit('connect_error', err);

    should(cb).be.calledOnce();
    should(cb.firstCall.args[0]).be.an.instanceOf(Error);
    should(cb.firstCall.args[0].internal).be.equal(err);

    return should(promise).be.rejectedWith('foobar');
  });

  it('should call connectError handler on unattended disconnect event', () => {
    const cb = sinon.spy();

    socketIO.forceDisconnect = false;
    socketIO.addListener('networkError', cb);
    socketIO.connect();
    socketIO.socket.emit('connect');

    socketIO.socket.emit('disconnect');

    should(cb).be.calledOnce();
  });
});

describe('SocketIO exposed methods', () => {
  beforeEach(() => {
    socketStub = {
      once: sinon.spy(),
      on: sinon.spy(),
      off: sinon.spy(),
      emit: sinon.spy(),
      close: sinon.spy()
    };

    socketIO = new SocketIO({host: 'address'});
    socketIO.socket = socketStub;

    window = {io: sinon.stub().returns(socketStub)}; // eslint-disable-line
  });

  it('should be able to listen to an event just once', () => {
    const cb = sinon.stub();

    socketIO.once('event', cb);
    should(socketIO.listeners('event')).match([cb]).and.have.length(1);
    should(socketStub.once).be.calledOnce();

    socketStub.once.firstCall.args[1]();
    should(cb).calledOnce();
    should(socketIO.listeners('event')).have.length(0);
  });

  it('should be able to listen to an event', () => {
    const cb = sinon.stub();

    socketIO.on('event', cb);
    should(socketIO.listeners('event')).match([cb]).and.have.length(1);
    should(socketStub.on).be.calledOnce();

    socketStub.on.firstCall.args[1]();
    should(cb).calledOnce();
    should(socketIO.listeners('event')).match([cb]).and.have.length(1);
  });

  it('should be able to remove an event listener', () => {
    const cb = function () {};

    socketIO.on('event', cb);
    should(socketIO.listeners('event')).match([cb]).and.have.length(1);
    should(socketStub.on).be.calledOnce();

    socketIO.removeListener('event', cb);
    should(socketStub.off).be.calledOnce();
    should(socketIO.listeners('event')).have.length(0);
  });

  it('should be able to send a payload', () => {
    socketIO.send('some data');
    should(socketStub.emit).be.calledOnce();
    should(socketStub.emit).be.calledWith('kuzzle', 'some data');
  });

  it('should be able to be closed', () => {
    socketIO.close();
    should(socketStub.close).be.calledOnce();
    should(socketIO.socket).be.null();
  });

  it('should remove all listeners from a given event', () => {
    socketIO.on('foo', function () {});
    socketIO.on('foo', function () {});
    socketIO.on('foo', function () {});
    socketIO.on('bar', function () {});

    should(socketIO.listeners('foo')).have.length(3);
    should(socketIO.listeners('bar')).have.length(1);

    socketIO.removeAllListeners('foo');

    should(socketIO.listeners('foo')).have.length(0);
    should(socketIO.listeners('bar')).have.length(1);
  });

  it('should remove all listeners from all events', () => {
    socketIO.on('foo', function () {});
    socketIO.on('foo', function () {});
    socketIO.on('foo', function () {});
    socketIO.on('bar', function () {});
    socketIO.on('baz', function () {});
    socketIO.on('baz', function () {});

    should(socketIO.listeners('foo')).have.length(3);
    should(socketIO.listeners('bar')).have.length(1);
    should(socketIO.listeners('baz')).have.length(2);

    socketIO.removeAllListeners();

    should(socketIO.listeners('foo')).have.length(0);
    should(socketIO.listeners('bar')).have.length(0);
    should(socketIO.listeners('baz')).have.length(0);
  });

  describe('#isReady', () => {
    it('should be ready if the instance is connected', () => {
      socketIO.state = 'connected';
      should(socketIO.isReady()).be.true();
    });

    it('should not be ready if the instance is offline', () => {
      socketIO.state = 'offline';
      should(socketIO.isReady()).be.false();
    });

    it('should not be ready if the instance is still connecting', () => {
      socketIO.state = 'connecting';
      should(socketIO.isReady()).be.false();
    });
  });
});
