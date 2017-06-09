var
  should = require('should'),
  sinon = require('sinon'),
  SocketIO = require('../../src/networkWrapper/wrappers/socketio');

/**
 * @global window
 */

describe('SocketIO network wrapper', function () {
  var
    socketIO,
    socketStub;

  describe('SocketIO networking module', function() {
    beforeEach(function () {
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

      socketIO = new SocketIO('address', 'port', false);
      socketIO.socket = socketStub;

      window = {io: sinon.stub().returns(socketStub)}; // eslint-disable-line
    });

    it('should connect with the right parameters', function () {
      socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');
      should(window.io.calledOnce).be.true();
      should(window.io.calledWithMatch('http://address:port', {
        reconnection: 'autoReconnectValue',
        reconnectionDelay: 'reconnectionDelayValue',
        forceNew: true
      })).be.true();
    });

    it('should connect with the secure connection', function () {
      socketIO.ssl = true;
      socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');
      should(window.io.calledWithMatch('https://address:port', {
        reconnection: 'autoReconnectValue',
        reconnectionDelay: 'reconnectionDelayValue',
        forceNew: true
      })).be.true();
    });

    it('should register onConnect callbacks to the right event', function () {
      var cb = sinon.spy();

      should(socketIO.handlers.connect.length).be.eql(0);

      socketIO.onConnect(cb);

      should(socketIO.handlers.connect.length).be.eql(1);
      should(socketIO.handlers.connect).containEql(cb);
    });

    it('should call connect handler on connect event', function () {
      var cb = sinon.spy();

      socketIO.wasConnected = false;
      socketIO.onConnect(cb);
      socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');

      socketIO.socket.emit('connect');

      should(cb.calledOnce).be.true();
    });

    it('should register onReconnect callbacks to the right event', function () {
      var cb = sinon.spy();

      should(socketIO.handlers.reconnect.length).be.eql(0);

      socketIO.onReconnect(cb);

      should(socketIO.handlers.reconnect.length).be.eql(1);
      should(socketIO.handlers.reconnect).containEql(cb);
    });

    it('should call reconnect handler on connect event when was already connected before', function () {
      var cb = sinon.spy();

      socketIO.wasConnected = true;
      socketIO.onReconnect(cb);
      socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');

      socketIO.socket.emit('connect');

      should(cb.calledOnce).be.true();
    });

    it('should register onDisconnect callbacks to the right event', function () {
      var cb = sinon.spy();

      should(socketIO.handlers.disconnect.length).be.eql(0);

      socketIO.onDisconnect(cb);

      should(socketIO.handlers.disconnect.length).be.eql(1);
      should(socketIO.handlers.disconnect).containEql(cb);
    });

    it('should call disconnect handler on attended disconnect event', function () {
      var cb = sinon.spy();

      socketIO.wasConnected = false;
      socketIO.forceDisconnect = true;
      socketIO.onDisconnect(cb);
      socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');

      socketIO.socket.emit('disconnect');

      should(cb.calledOnce).be.true();
    });

    it('should register onConnectError callbacks to the right event', function () {
      var cb = sinon.spy();

      should(socketIO.handlers.connectError.length).be.eql(0);

      socketIO.onConnectError(cb);

      should(socketIO.handlers.connectError.length).be.eql(1);
      should(socketIO.handlers.connectError).containEql(cb);
    });

    it('should call connectError handler on connect error event', function () {
      var cb = sinon.spy();
      var err = new Error('foobar');

      socketIO.onConnectError(cb);
      socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');

      socketIO.socket.emit('connect_error', err);

      should(cb)
        .be.calledOnce();

      should(cb)
        .be.calledWith(err);
    });

    it('should call connectError handler on unattended disconnect event', function () {
      var cb = sinon.spy();

      socketIO.forceDisconnect = false;
      socketIO.onConnectError(cb);
      socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');

      socketIO.socket.emit('disconnect');

      should(cb)
        .be.calledOnce();
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

      socketIO = new SocketIO('address', 'port', false);
      socketIO.socket = socketStub;

      window = {io: sinon.stub().returns(socketStub)}; // eslint-disable-line
    });

    it('should be able to listen to an event just once', function () {
      var cb = function () {};

      socketIO.once('event', cb);
      should(socketStub.once.calledOnce).be.true();
      should(socketStub.once.calledWith('event', cb)).be.true();
    });

    it('should be able to listen to an event', function () {
      var cb = function () {};

      socketIO.on('event', cb);
      should(socketStub.on.calledOnce).be.true();
      should(socketStub.on.calledWith('event', cb)).be.true();
    });

    it('should be able to remove an event listener', function () {
      var cb = function () {};

      socketIO.off('event', cb);
      should(socketStub.off.calledOnce).be.true();
      should(socketStub.off.calledWith('event', cb)).be.true();
    });

    it('should be able to send a payload', function () {
      socketIO.send('some data');
      should(socketStub.emit.calledOnce).be.true();
      should(socketStub.emit.calledWith('kuzzle', 'some data')).be.true();
    });

    it('should be able to be closed', function () {
      socketIO.close();
      should(socketStub.close.calledOnce).be.true();
      should(socketIO.socket).be.null();
    });
  });
});
