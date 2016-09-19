var
  should = require('should'),
  sinon = require('sinon'),
  WSBrowsers = require('../../src/networkWrapper/wrappers/wsbrowsers');

describe('WebSocket Browsers networking module', () => {
  var
    wsbrowsers,
    wsargs,
    clientStub;

  beforeEach(() => {
    clientStub = {
      send: sinon.stub(),
      close: sinon.stub()
    };

    WebSocket = function () {
      wsargs = Array.prototype.slice.call(arguments);
      return clientStub;
    };

    wsbrowsers = new WSBrowsers('address', 'port', false);
  });

  afterEach(() => {
    WebSocket = undefined;
  });

  it('should initialize a WS connection properly', () => {
    clientStub.on = sinon.stub();
    wsbrowsers.connect('autoReconnect', 'reconnectionDelay');
    should(wsargs).match(['ws://address:port']);
    should(clientStub.onopen).not.be.undefined();
    should(clientStub.onclose).not.be.undefined();
    should(clientStub.onerror).not.be.undefined();
    should(clientStub.onmessage).not.be.undefined();
  });

  it('should initialize a WS secure connection', () => {
    clientStub.on = sinon.stub();
    wsbrowsers.ssl = true;
    wsbrowsers.connect('autoReconnect', 'reconnectionDelay');
    should(wsargs).match(['wss://address:port']);
  });

  it('should call listeners on a "open" event', () => {
    var cb = sinon.stub();

    wsbrowsers.retrying = false;
    wsbrowsers.onConnect(cb);
    wsbrowsers.listeners.reconnect.push(() => {throw(new Error('wrong event called'));});
    should(wsbrowsers.listeners.connect.length).be.eql(1);

    wsbrowsers.connect();
    clientStub.onopen();

    should(cb.calledOnce).be.true();
    should(wsbrowsers.listeners.connect.length).be.eql(1);
  });

  it('should call listeners on a "reconnect" event', () => {
    var cb = sinon.stub();

    wsbrowsers.retrying = true;
    wsbrowsers.onReconnect(cb);
    wsbrowsers.listeners.connect.push(() => {throw(new Error('wrong event called'));});
    should(wsbrowsers.listeners.reconnect.length).be.eql(1);

    wsbrowsers.connect();
    clientStub.onopen();

    should(cb.calledOnce).be.true();
    should(wsbrowsers.listeners.reconnect.length).be.eql(1);
  });

  it('should try to reconnect on a connection error with autoReconnect = true', () => {
    var
      cb = sinon.stub(),
      clock = sinon.useFakeTimers();

    wsbrowsers.retrying = false;
    wsbrowsers.onConnectError(cb);
    should(wsbrowsers.listeners.error.length).be.eql(1);

    wsbrowsers.connect(true, 10);
    wsbrowsers.connect = sinon.stub();
    clientStub.onerror();
    clock.tick(10);

    should(cb.calledOnce).be.true();
    should(wsbrowsers.listeners.error.length).be.eql(1);
    should(wsbrowsers.retrying).be.true();
    should(wsbrowsers.connect.calledOnce).be.true();
    clock.restore();
  });

  it('should not try to reconnect on a connection error with autoReconnect = false', () => {
    var
      cb = sinon.stub(),
      clock = sinon.useFakeTimers();

    wsbrowsers.retrying = false;
    wsbrowsers.onConnectError(cb);
    should(wsbrowsers.listeners.error.length).be.eql(1);

    wsbrowsers.connect(false, 10);
    wsbrowsers.connect = sinon.stub();
    clientStub.onerror();
    clock.tick(10);

    should(cb.calledOnce).be.true();
    should(wsbrowsers.listeners.error.length).be.eql(1);
    should(wsbrowsers.retrying).be.false();
    should(wsbrowsers.connect.calledOnce).be.false();
    clock.restore();
  });

  it('should call listeners on a "disconnect" event', () => {
    var cb = sinon.stub();

    wsbrowsers.retrying = false;
    wsbrowsers.onDisconnect(cb);
    should(wsbrowsers.listeners.disconnect.length).be.eql(1);

    wsbrowsers.connect();
    clientStub.onclose(1000);

    should(cb.calledOnce).be.true();
    should(wsbrowsers.listeners.disconnect.length).be.eql(1);
  });

  it('should call error listeners on a disconnect event with an abnormal websocket code', () => {
    var cb = sinon.stub();

    wsbrowsers.retrying = false;
    wsbrowsers.onConnectError(cb);
    should(wsbrowsers.listeners.error.length).be.eql(1);

    wsbrowsers.connect();
    clientStub.onclose(4666, 'foobar');

    should(cb.calledOnce).be.true();
    should(cb.calledWith('foobar'));
    should(wsbrowsers.listeners.error.length).be.eql(1);
  });

  it('should be able to register ephemeral callbacks on an event', () => {
    var
      cb = sinon.stub(),
      payload = {room: 'foobar'};

    wsbrowsers.once('foobar', cb);
    wsbrowsers.once('foobar', cb);
    wsbrowsers.once('barfoo', cb);
    wsbrowsers.connect();

    should(wsbrowsers.listeners.foobar).match([{fn: cb, keep: false}, {fn: cb, keep: false}]);
    should(wsbrowsers.listeners.barfoo).match([{fn: cb, keep: false}]);

    clientStub.onmessage({data: JSON.stringify(payload)});

    should(wsbrowsers.listeners.foobar).be.undefined();
    should(wsbrowsers.listeners.barfoo).match([{fn: cb, keep: false}]);
    should(cb.calledTwice).be.true();
    should(cb.alwaysCalledWithMatch(payload)).be.true();
  });

  it('should be able to register persistent callbacks on an event', () => {
    var
      cb = sinon.stub(),
      payload = {room: 'foobar'};

    wsbrowsers.on('foobar', cb);
    wsbrowsers.on('foobar', cb);
    wsbrowsers.connect();

    should(wsbrowsers.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);

    clientStub.onmessage({data: JSON.stringify(payload)});

    should(wsbrowsers.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);
    should(cb.calledTwice).be.true();
    should(cb.alwaysCalledWithMatch(payload)).be.true();
  });

  it('should be able to unregister a callback on an event', () => {
    var
      cb = sinon.stub();

    wsbrowsers.on('foobar', cb);
    wsbrowsers.on('foobar', cb);
    wsbrowsers.connect();

    should(wsbrowsers.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);

    wsbrowsers.off('foobar', cb);
    should(wsbrowsers.listeners.foobar).match([{fn: cb, keep: true}]);

    wsbrowsers.off('foobar', cb);
    should(wsbrowsers.listeners.foobar).be.undefined();
  });

  it('should do nothing if trying to unregister an non-existent event/callback', () => {
    var
      cb = sinon.stub();

    wsbrowsers.on('foobar', cb);
    wsbrowsers.on('foobar', cb);
    wsbrowsers.connect();

    should(wsbrowsers.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);

    wsbrowsers.off('foo', cb);
    should(wsbrowsers.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);

    wsbrowsers.off('foobar', sinon.stub());
    should(wsbrowsers.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);
  });

  it('should send data payload through websocket', () => {
    var data = {foo: 'bar'};

    clientStub.readyState = clientStub.OPEN = true;
    wsbrowsers.connect();
    wsbrowsers.send(data);

    should(clientStub.send.calledOnce).be.true();
    should(clientStub.send.calledWith(JSON.stringify(data))).be.true();
  });

  it('should discard messages if the socket is not ready', () => {
    var data = {foo: 'bar'};

    clientStub.readyState = 'foo';
    clientStub.OPEN = 'bar';
    wsbrowsers.connect();
    wsbrowsers.send(data);

    should(clientStub.send.called).be.false();
  });

  it('should properly close a connection when asked', () => {
    var
      cb = sinon.stub();

    wsbrowsers.on('foobar', cb);
    wsbrowsers.onConnect(cb);
    wsbrowsers.onDisconnect(cb);
    wsbrowsers.onConnectError(cb);
    wsbrowsers.onReconnect(cb);
    wsbrowsers.retrying = true;

    wsbrowsers.connect();
    wsbrowsers.close();

    should(wsbrowsers.listeners.foobar).be.undefined();
    should(wsbrowsers.listeners.error).be.empty();
    should(wsbrowsers.listeners.connect).be.empty();
    should(wsbrowsers.listeners.reconnect).be.empty();
    should(wsbrowsers.listeners.disconnect).be.empty();
    should(wsbrowsers.client).be.null();
    should(clientStub.close.called).be.true();
    should(wsbrowsers.retrying).be.false();
  });
});
