var
  should = require('should'),
  WSNode = require('../../src/networkWrapper/wrappers/wsnode'),
  WSBrowsers = require('../../src/networkWrapper/wrappers/wsbrowsers'),
  SocketIO = require('../../src/networkWrapper/wrappers/socketio'),
  Wrapper = require('../../src/networkWrapper');

describe('Network Wrapper', () => {
  afterEach(() => {
    window = undefined;
    WebSocket = undefined;
  });

  it('should instantiate a WSNode object if not in a Web Browser', () => {
    should(Wrapper()).be.instanceof(WSNode);
  });

  it('should instantiate a WSBrowsers object if in a Web Browser with WS support', () => {
    window = 'foo';
    WebSocket = 'bar';
    should(Wrapper()).be.instanceof(WSBrowsers);
  });

  it('should instantiate a SocketIO object if in a Web Browser without WS support', () => {
    window = { io: 'foobar' };
    should(Wrapper()).be.instanceof(SocketIO);
  });

  it('should throw if in WebBrowser without WS support nor SocketIO library', () => {
    window = 'foo';
    should(() => Wrapper()).throw('Aborting: no websocket support detected and no socket.io library loaded either.');
  });
});
