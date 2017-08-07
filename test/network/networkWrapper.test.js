var
  should = require('should'),
  WS = require('../../src/networkWrapper/wrappers/websocket'),
  SocketIO = require('../../src/networkWrapper/wrappers/socketio'),
  Wrapper = require('../../src/networkWrapper');

/**
 * @global window
 * @global WebSocket
 */

describe('Network Wrapper', function () {
  beforeEach(function () {
    window = undefined; // eslint-disable-line
    WebSocket = undefined; // eslint-disable-line
  });

  it('should instantiate a WS object in NodeJS environment', function() {
    should(Wrapper('websocket')).be.instanceof(WS);
  });

  it('should instantiate a WS object if in a Web Browser with WebSocket support', function() {
    window = 'foo'; // eslint-disable-line
    WebSocket = 'bar'; // eslint-disable-line
    should(Wrapper('websocket')).be.instanceof(WS);
  });

  it('should throw if trying to instantiate a WS object in a Web Browser without WebSocket support', function () {
    window = 'foo'; // eslint-disable-line
    should(function () { Wrapper('websocket'); }).throw('Aborting: no websocket support detected.');
  });

  it('should instantiate a SocketIO object with the socket.io library', function () {
    window = { io: 'foobar' }; // eslint-disable-line
    should(Wrapper('socketio')).be.instanceof(SocketIO);
  });

  it('should throw if trying to instantiate a SocketIO object without the socket.io library', function () {
    window = 'foo'; // eslint-disable-line
    should(function () { Wrapper('socketio'); }).throw('Aborting: no socket.io library loaded.');
  });

  it('should throw if trying to instantiate a network wrapper with an unknown protocol', function () {
    should(function () { Wrapper('foobar'); }).throw('Aborting: unknown protocol "foobar" (only "websocket" and "socketio" are available).');
  });
});
