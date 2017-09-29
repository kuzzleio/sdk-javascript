var
  should = require('should'),
  sinon = require('sinon'),
  SocketIO = require('../../src/networkWrapper/protocols/socketio');

/**
 * @global window
 */

describe('SocketIO network wrapper', function () {
  var
    clock,
    socketIO,
    socketStub;

  describe('SocketIO networking module', function() {
    beforeEach(function () {
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
          var i;

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
        emit: function(evt) {
          var i;
          var args = Array.prototype.slice.call(arguments, 1);
          if (socketStub.eventOnce[evt]) {
            for (i in socketStub.eventOnce[evt]) {
              if (typeof socketStub.eventOnce[evt][i] === 'function') {
                socketStub.eventOnce[evt][i].apply(socketIO, args);
                delete socketStub.eventOnce[evt][i];
              }
            }
          }
          if (socketStub.events[evt]) {
            for (i in socketStub.events[evt]) {
              if (typeof socketStub.events[evt][i] === 'function') {
                socketStub.events[evt][i].apply(socketIO, args);
              }
            }
          }
        },
        close: sinon.spy()
      };

      socketIO = new SocketIO('address', {
        port: 1234,
        autoReconnect: 'autoReconnectValue',
        reconnectionDelay: 'reconnectionDelayValue'
      });
      socketIO.socket = socketStub;

      window = {io: sinon.stub().returns(socketStub)}; // eslint-disable-line
    });

    afterEach(function () {
      clock.restore();
    });

    it('should initialize network status when connecting', function () {
      socketIO.connect();
      should(socketIO.state).be.eql('connecting');
      should(socketIO.queuing).be.false();
    });

    it('should start queuing if autoQueue option is set', function () {
      socketIO.autoQueue = true;
      socketIO.connect();
      should(socketIO.queuing).be.true();
    });

    it('should connect with the right parameters', function () {
      socketIO.connect();
      should(window.io).be.calledOnce();
      should(window.io).be.calledWithMatch('http://address:1234', {
        reconnection: 'autoReconnectValue',
        reconnectionDelay: 'reconnectionDelayValue',
        forceNew: true
      });
    });

    it('should connect with the secure connection', function () {
      socketIO.ssl = true;
      socketIO.connect();
      should(window.io.calledWithMatch('https://address:1234', {
        reconnection: 'autoReconnectValue',
        reconnectionDelay: 'reconnectionDelayValue',
        forceNew: true
      })).be.true();
    });

    it('should call listeners on connect event', function () {
      var cb = sinon.stub();

      should(socketIO.listeners('connect').length).be.eql(0);
      should(socketIO.listeners('reconnect').length).be.eql(0);

      socketIO.retrying = false;
      socketIO.addListener('connect', cb);
      should(socketIO.listeners('connect').length).be.eql(1);
      should(socketIO.listeners('reconnect').length).be.eql(0);

      socketIO.connect();
      socketIO.socket.emit('connect');

      should(cb).be.calledOnce();
    });


    it('should change the state when the client connection is established', function () {
      socketIO.state = 'connecting';
      socketIO.queuing = true;

      socketIO.connect();
      socketIO.socket.emit('connect');
      should(socketIO.state).be.eql('connected');
      should(socketIO.wasConnected).be.true();
      should(socketIO.stopRetryingToConnect).be.false();
    });

    it('should stop queuing when the client connection is established if autoQueue option is set', function () {
      socketIO.queuing = true;
      socketIO.autoQueue = true;

      socketIO.connect();
      socketIO.socket.emit('connect');
      should(socketIO.queuing).be.false();
    });

    it('should not stop queuing when the client connection is established if autoQueue option is not set', function () {
      socketIO.queuing = true;
      socketIO.autoQueue = false;

      socketIO.connect();
      socketIO.socket.emit('connect');
      should(socketIO.queuing).be.true();
    });

    it('should play the queue when the client connection is established if autoReplay option is set', function () {
      socketIO.playQueue = sinon.stub();
      socketIO.autoReplay = true;

      socketIO.connect();
      socketIO.socket.emit('connect');
      should(socketIO.playQueue).be.calledOnce();
    });

    it('should not play the queue when the client connection is established if autoReplay option is not set', function () {
      socketIO.playQueue = sinon.stub();
      socketIO.autoReplay = false;

      socketIO.connect();
      socketIO.socket.emit('connect');
      should(socketIO.playQueue).not.be.called();
    });

    it('should call listeners on a "reconnect" event', function () {
      var cb = sinon.stub();

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

    it('should call listeners on a "disconnect" event', function () {
      var cb = sinon.stub();

      should(socketIO.listeners('disconnect').length).be.eql(0);

      socketIO.forceDisconnect = true;
      socketIO.addListener('disconnect', cb);
      should(socketIO.listeners('disconnect').length).be.eql(1);

      socketIO.connect();
      socketIO.socket.emit('disconnect');

      should(cb).be.calledOnce();
    });

    it('should start queuing when the client is disconnected if autoQueue option is set', function () {
      socketIO.queuing = false;
      socketIO.autoQueue = true;

      socketIO.connect();
      socketIO.socket.emit('disconnect');

      clock.tick(10);
      should(socketIO.queuing).be.true();
    });

    it('should not start queuing when the client is disconnected if autoQueue option is not set', function () {
      socketIO.queuing = false;
      socketIO.autoQueue = false;

      socketIO.connect();
      socketIO.socket.emit('disconnect');

      clock.tick(10);
      should(socketIO.queuing).be.false();
    });

    it('should call listeners on a connect error event', function () {
      var
        cb = sinon.stub(),
        err = new Error('foobar');

      should(socketIO.listeners('networkError').length).be.eql(0);

      socketIO.forceDisconnect = true;
      socketIO.addListener('networkError', cb);
      should(socketIO.listeners('networkError').length).be.eql(1);

      socketIO.connect();
      socketIO.socket.emit('connect_error', err);

      should(cb).be.calledOnce();
      should(cb).be.calledWith(err);
    });

    it('should start queuing when the client is disconnected with an error, if autoQueue option is set', function () {
      var err = new Error('foobar');

      socketIO.queuing = false;
      socketIO.autoQueue = true;
      socketIO.forceDisconnect = true;

      socketIO.connect();
      socketIO.socket.emit('connect_error', err);

      clock.tick(10);
      should(socketIO.queuing).be.true();
    });

    it('should not start queuing when the client is disconnected with an error, if autoQueue option is not set', function () {
      var err = new Error('foobar');

      socketIO.queuing = false;
      socketIO.autoQueue = false;
      socketIO.forceDisconnect = true;

      socketIO.connect();
      socketIO.socket.emit('connect_error', err);

      clock.tick(10);
      should(socketIO.queuing).be.false();
    });

    it('should call connectError handler on unattended disconnect event', function () {
      var cb = sinon.spy();

      socketIO.forceDisconnect = false;
      socketIO.addListener('networkError', cb);
      socketIO.connect();

      socketIO.socket.emit('disconnect');

      should(cb).be.calledOnce();
    });
  });

  describe('SocketIO exposed methods', function() {
    beforeEach(function () {
      socketStub = {
        once: sinon.spy(),
        on: sinon.spy(),
        off: sinon.spy(),
        emit: sinon.spy(),
        close: sinon.spy()
      };

      socketIO = new SocketIO('address');
      socketIO.socket = socketStub;

      window = {io: sinon.stub().returns(socketStub)}; // eslint-disable-line
    });

    it('should be able to listen to an event just once', function () {
      var cb = function () {};

      socketIO.once('event', cb);
      should(socketStub.once).be.calledOnce();
      should(socketStub.once).be.calledWith('event', cb);
    });

    it('should be able to listen to an event', function () {
      var cb = function () {};

      socketIO.on('event', cb);
      should(socketStub.on).be.calledOnce();
      should(socketStub.on).be.calledWith('event', cb);
    });

    it('should be able to remove an event listener', function () {
      var cb = function () {};

      socketIO.off('event', cb);
      should(socketStub.off).be.calledOnce();
      should(socketStub.off).be.calledWith('event', cb);
    });

    it('should be able to send a payload', function () {
      socketIO.send('some data');
      should(socketStub.emit).be.calledOnce();
      should(socketStub.emit).be.calledWith('kuzzle', 'some data');
    });

    it('should be able to be closed', function () {
      socketIO.close();
      should(socketStub.close).be.calledOnce();
      should(socketIO.socket).be.null();
    });
  });
});
