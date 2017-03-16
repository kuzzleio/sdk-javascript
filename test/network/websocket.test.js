var
  should = require('should'),
  sinon = require('sinon'),
  WS = require('../../src/networkWrapper/wrappers/websocket');

describe('WebSocket networking module', function () {
  var
    websocket,
    wsargs,
    clientStub;

  beforeEach(function () {
    clientStub = {
      send: sinon.stub(),
      close: sinon.stub()
    };

    window = 'foobar'; // eslint-disable-line
    WebSocket = function () { // eslint-disable-line
      wsargs = Array.prototype.slice.call(arguments);
      return clientStub;
    };

    websocket = new WS('address', 'port', false);
  });

  afterEach(function () {
    WebSocket = undefined; // eslint-disable-line
    window = undefined; // eslint-disable-line
  });

  it('should initialize a WS connection properly', function () {
    clientStub.on = sinon.stub();
    websocket.connect('autoReconnect', 'reconnectionDelay');
    should(wsargs).match(['ws://address:port']);
    should(clientStub.onopen).not.be.undefined();
    should(clientStub.onclose).not.be.undefined();
    should(clientStub.onerror).not.be.undefined();
    should(clientStub.onmessage).not.be.undefined();
  });

  it('should initialize a WS secure connection', function () {
    clientStub.on = sinon.stub();
    websocket.ssl = true;
    websocket.connect('autoReconnect', 'reconnectionDelay');
    should(wsargs).match(['wss://address:port']);
  });

  it('should call listeners on a "open" event', function (done) {
    var cb = sinon.stub();

    websocket.retrying = false;
    websocket.onConnect(cb);
    should(websocket.eventEmitter.eventListeners.connect.listeners.length).be.eql(1);
    should(websocket.eventEmitter.eventListeners.reconnect).be.undefined();

    websocket.connect();
    clientStub.onopen();
    setTimeout(function () {
      should(cb.calledOnce).be.true();
      should(websocket.eventEmitter.eventListeners.connect.listeners.length).be.eql(1);
      done();
    }, 0);
  });

  it('should call listeners on a "reconnect" event', function (done) {
    var cb = sinon.stub();

    websocket.wasConnected = true;
    websocket.lasturl = 'ws://address:port';
    websocket.onReconnect(cb);
    should(websocket.eventEmitter.eventListeners.connect).be.undefined();
    should(websocket.eventEmitter.eventListeners.reconnect.listeners.length).be.eql(1);

    websocket.connect();
    clientStub.onopen();

    setTimeout(function () {
      should(cb.calledOnce).be.true();
      should(websocket.eventEmitter.eventListeners.reconnect.listeners.length).be.eql(1);
      done();
    }, 0);
  });

  it('should try to reconnect on a connection error with autoReconnect = true', function () {
    var
      cb = sinon.stub(),
      clock = sinon.useFakeTimers();

    websocket.retrying = false;
    websocket.onConnectError(cb);
    should(websocket.eventEmitter.eventListeners.error.listeners.length).be.eql(1);

    websocket.connect(true, 10);
    websocket.connect = sinon.stub();
    clientStub.onerror();
    should(websocket.retrying).be.true();
    clock.tick(10);

    should(cb.calledOnce).be.true();
    should(websocket.eventEmitter.eventListeners.error.listeners.length).be.eql(1);
    should(websocket.retrying).be.false();
    should(websocket.connect.calledOnce).be.true();
    clock.restore();
  });

  it('should not try to reconnect on a connection error with autoReconnect = false', function () {
    var
      cb = sinon.stub(),
      clock = sinon.useFakeTimers();

    websocket.retrying = false;
    websocket.onConnectError(cb);
    should(websocket.eventEmitter.eventListeners.error.listeners.length).be.eql(1);

    websocket.connect(false, 10);
    websocket.connect = sinon.stub();
    clientStub.onerror();
    clock.tick(10);

    should(cb.calledOnce).be.true();
    should(websocket.eventEmitter.eventListeners.error.listeners.length).be.eql(1);
    should(websocket.retrying).be.false();
    should(websocket.connect.calledOnce).be.false();
    clock.restore();
  });

  it('should call listeners on a "disconnect" event', function (done) {
    var cb = sinon.stub();

    websocket.retrying = false;
    websocket.onDisconnect(cb);
    should(websocket.eventEmitter.eventListeners.disconnect.listeners.length).be.eql(1);

    websocket.connect();
    clientStub.onclose(1000);

    setTimeout(function () {
      should(cb.calledOnce).be.true();
      should(websocket.eventEmitter.eventListeners.disconnect.listeners.length).be.eql(1);
      done();
    }, 0);
  });

  it('should call error listeners on a disconnect event with an abnormal websocket code', function (done) {
    var cb = sinon.stub();

    websocket.retrying = false;
    websocket.onConnectError(cb);
    should(websocket.eventEmitter.eventListeners.error.listeners.length).be.eql(1);

    websocket.connect();
    clientStub.onclose(4666, 'foobar');

    setTimeout(function () {
      should(cb.calledOnce).be.true();
      should(cb.calledWith('foobar'));
      should(websocket.eventEmitter.eventListeners.error.listeners.length).be.eql(1);
      done();
    }, 0);
  });

  it('should be able to register ephemeral callbacks on an event', function (done) {
    var
      cb = sinon.stub(),
      payload = {room: 'foobar'};

    websocket.once('foobar', cb);
    websocket.once('foobar', cb);
    websocket.once('barfoo', cb);
    websocket.connect();

    should(websocket.eventEmitter.eventListeners.foobar.listeners.length).be.equal(2);
    should(websocket.eventEmitter.eventListeners.barfoo.listeners.length).be.equal(1);

    clientStub.onmessage({data: JSON.stringify(payload)});

    setTimeout(function () {
      should(websocket.eventEmitter.eventListeners.foobar.listeners.length).be.equal(0);
      should(websocket.eventEmitter.eventListeners.barfoo.listeners.length).be.equal(1);
      should(cb.calledTwice).be.true();
      should(cb.alwaysCalledWithMatch(payload)).be.true();
      done();
    }, 0);
  });

  it('should be able to register persistent callbacks on an event', function (done) {
    var
      cb = sinon.stub(),
      payload = {room: 'foobar'};

    websocket.on('foobar', cb);
    websocket.on('foobar', cb);
    websocket.connect();

    should(websocket.eventEmitter.eventListeners.foobar.listeners.length).be.equal(2);

    clientStub.onmessage({data: JSON.stringify(payload)});

    setTimeout(function () {
      should(websocket.eventEmitter.eventListeners.foobar.listeners.length).be.equal(2);
      should(cb.calledTwice).be.true();
      should(cb.alwaysCalledWithMatch(payload)).be.true();
      done();
    }, 0);
  });

  it('should send the message on room "discarded" if no room specified', function (done) {
    var
      cb = sinon.stub(),
      payload = {};

    websocket.on('discarded', cb);
    websocket.connect();

    clientStub.onmessage({data: JSON.stringify(payload)});

    setTimeout(function () {
      should(cb.calledOnce).be.true();
      should(cb.alwaysCalledWithMatch(payload)).be.true();
      done();
    }, 0);
  });

  it('should be able to unregister a callback on an event', function () {
    var
      cb = sinon.stub();

    websocket.on('foobar', cb);
    websocket.on('foobar', cb);
    websocket.connect();

    should(websocket.eventEmitter.eventListeners.foobar.listeners).match([{fn: cb}, {fn: cb}]);

    websocket.off('foobar', cb);
    should(websocket.eventEmitter.eventListeners.foobar.listeners).match([{fn: cb}]);

    websocket.off('foobar', cb);
    should(websocket.eventEmitter.eventListeners.foobar.listeners.length).be.equal(0);
  });

  it('should do nothing if trying to unregister an non-existent event/callback', function () {
    var
      cb = sinon.stub();

    websocket.on('foobar', cb);
    websocket.on('foobar', cb);
    websocket.connect();

    should(websocket.eventEmitter.eventListeners.foobar.listeners).match([{fn: cb}, {fn: cb}]);

//    websocket.off('foo', cb);
//    should(websocket.eventEmitter.eventListeners.foobar.listeners).match([{fn: cb}, {fn: cb}]);

    websocket.off('foobar', sinon.stub());
    should(websocket.eventEmitter.eventListeners.foobar.listeners).match([{fn: cb}, {fn: cb}]);
  });

  it('should send data payload through websocket', function () {
    var data = {foo: 'bar'};

    clientStub.readyState = clientStub.OPEN = true;
    websocket.connect();
    websocket.send(data);

    should(clientStub.send.calledOnce).be.true();
    should(clientStub.send.calledWith(JSON.stringify(data))).be.true();
  });

  it('should discard messages if the socket is not ready', function () {
    var data = {foo: 'bar'};

    clientStub.readyState = 'foo';
    clientStub.OPEN = 'bar';
    websocket.connect();
    websocket.send(data);

    should(clientStub.send.called).be.false();
  });

  it('should properly close a connection when asked', function () {
    var
      cb = sinon.stub();

    websocket.on('foobar', cb);
    websocket.onConnect(cb);
    websocket.onDisconnect(cb);
    websocket.onConnectError(cb);
    websocket.onReconnect(cb);
    websocket.retrying = true;

    websocket.connect();
    websocket.close();

    should(websocket.eventEmitter.eventListeners.foobar.listeners).be.empty();
    should(websocket.eventEmitter.eventListeners.error.listeners).be.empty();
    should(websocket.eventEmitter.eventListeners.connect.listeners).be.empty();
    should(websocket.eventEmitter.eventListeners.reconnect.listeners).be.empty();
    should(websocket.eventEmitter.eventListeners.disconnect.listeners).be.empty();
    should(websocket.client).be.null();
    should(clientStub.close.called).be.true();
    should(websocket.wasConnected).be.false();
  });
});
