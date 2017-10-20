var
  should = require('should'),
  WS = require('../../src/networkWrapper/wrappers/websocket'),
  SocketIO = require('../../src/networkWrapper/wrappers/socketio'),
  Wrapper = require('../../src/networkWrapper');

/**
 * @global window
 */

describe('Network Wrapper', function () {
  afterEach(function () {
    // eslint-disable-next-line no-native-reassign, no-global-assign
    window = undefined;
    // eslint-disable-next-line no-native-reassign, no-global-assign
    WebSocket = undefined;
  });

  it('should instantiate a WebSocket object if not in a Web Browser', function () {
    should(Wrapper()).be.instanceof(WS);
  });

  it('should instantiate a WebSocket object if in a Web Browser with WS support', function () {
    window = 'foo'; // eslint-disable-line
    WebSocket = 'bar'; // eslint-disable-line
    should(Wrapper()).be.instanceof(WS);
  });

  it('should instantiate a SocketIO object if in a Web Browser without WS support', function () {
    window = { io: 'foobar' }; // eslint-disable-line
    should(Wrapper()).be.instanceof(SocketIO);
  });

  it('should throw if in WebBrowser without WS support nor SocketIO library', function () {
    window = 'foo'; // eslint-disable-line
    should(function () { Wrapper(); }).throw('Aborting: no websocket support detected and no socket.io library loaded either.');
  });
});
