const
  should = require('should'),
  WS = require('../../src/networkWrapper/protocols/websocket'),
  SocketIO = require('../../src/networkWrapper/protocols/socketio'),
  HttpWrapper = require('../../src/networkWrapper/protocols/http'),
  Wrapper = require('../../src/networkWrapper');

/**
 * @global window
 * @global WebSocket
 */

describe('Network Wrapper', function () {
  afterEach(function () {
    // eslint-disable-next-line no-native-reassign, no-global-assign
    window = undefined;
    // eslint-disable-next-line no-native-reassign, no-global-assign
    WebSocket = undefined;
  });

  it('should instantiate a WS object in NodeJS environment', function() {
    should(Wrapper('websocket', {host: 'somewhere'})).be.instanceof(WS);
  });

  it('should instantiate a WS object if in a Web Browser with WebSocket support', function() {
    window = 'foo'; // eslint-disable-line
    WebSocket = 'bar'; // eslint-disable-line
    should(Wrapper('websocket', {host: 'somewhere'})).be.instanceof(WS);
  });

  it('should throw if trying to instantiate a WS object in a Web Browser without WebSocket support', function () {
    window = 'foo'; // eslint-disable-line
    should(function () { Wrapper('websocket', {host: 'somewhere'}); }).throw('Aborting: no websocket support detected.');
  });

  it('should instantiate a SocketIO object with the socket.io library', function () {
    window = { io: 'foobar' }; // eslint-disable-line
    should(Wrapper('socketio', {host: 'somewhere'})).be.instanceof(SocketIO);
  });

  it('should throw if trying to instantiate a SocketIO object without the socket.io library', function () {
    window = 'foo'; // eslint-disable-line
    should(function () { Wrapper('socketio', {host: 'somewhere'}); }).throw('Aborting: no socket.io library loaded.');
  });

  it('should instantiate an HttpWrapper object', function () {
    should(Wrapper('http', {host: 'somewhere'})).be.instanceof(HttpWrapper);
  });

  it('should throw if trying to instantiate a network wrapper with an unknown protocol', function () {
    should(function () { Wrapper('foobar', {host: 'somewhere'}); }).throw('Aborting: unknown protocol "foobar" (only "http", "websocket" and "socketio" are available).');
  });
});
