var
  should = require('should'),
  EventEmitter = require('events').EventEmitter,
  sinon = require('sinon'),
  proxyquire = require('proxyquire');

describe('WebSocket NodeJS networking module', () => {
  var
    WSNode,
    wsnode,
    wsargs,
    clientStub;

  beforeEach(() => {
    clientStub = new EventEmitter();
    clientStub.send = sinon.stub();
    clientStub.close = sinon.stub();

    WSNode = proxyquire('../../src/networkWrapper/wrappers/wsnode', {
      'ws': function () {
        wsargs = Array.prototype.slice.call(arguments);
        return clientStub;
      }
    });

    wsnode = new WSNode('address', 'port');
  });

  it('should initialize a WS connection properly', () => {
    clientStub.on = sinon.stub();
    wsnode.connect('autoReconnect', 'reconnectionDelay');
    should(wsargs).match(['ws://address:port', {perMessageDeflate: false}]);
    should(clientStub.on.callCount).be.eql(4);
    should(clientStub.on.calledWithMatch('open', sinon.match.func)).be.true();
    should(clientStub.on.calledWithMatch('close', sinon.match.func)).be.true();
    should(clientStub.on.calledWithMatch('error', sinon.match.func)).be.true();
    should(clientStub.on.calledWithMatch('message', sinon.match.func)).be.true();
  });

  it('should call listeners on a "open" event', () => {
    var cb = sinon.stub();

    wsnode.retrying = false;
    wsnode.onConnect(cb);
    wsnode.listeners.reconnect.push(() => {throw(new Error('wrong event called'));});
    should(wsnode.listeners.connect.length).be.eql(1);

    wsnode.connect();
    clientStub.emit('open');

    should(cb.calledOnce).be.true();
    should(wsnode.listeners.connect.length).be.eql(1);
  });

  it('should call listeners on a "reconnect" event', () => {
    var cb = sinon.stub();

    wsnode.retrying = true;
    wsnode.onReconnect(cb);
    wsnode.listeners.connect.push(() => {throw(new Error('wrong event called'));});
    should(wsnode.listeners.reconnect.length).be.eql(1);

    wsnode.connect();
    clientStub.emit('open');

    should(cb.calledOnce).be.true();
    should(wsnode.listeners.reconnect.length).be.eql(1);
  });

  it('should try to reconnect on a connection error with autoReconnect = true', () => {
    var
      cb = sinon.stub(),
      clock = sinon.useFakeTimers();

    wsnode.retrying = false;
    wsnode.onConnectError(cb);
    should(wsnode.listeners.error.length).be.eql(1);

    wsnode.connect(true, 10);
    wsnode.connect = sinon.stub();
    clientStub.emit('error');
    clock.tick(10);

    should(cb.calledOnce).be.true();
    should(wsnode.listeners.error.length).be.eql(1);
    should(wsnode.retrying).be.true();
    should(wsnode.connect.calledOnce).be.true();
    clock.restore();
  });

  it('should not try to reconnect on a connection error with autoReconnect = false', () => {
    var
      cb = sinon.stub(),
      clock = sinon.useFakeTimers();

    wsnode.retrying = false;
    wsnode.onConnectError(cb);
    should(wsnode.listeners.error.length).be.eql(1);

    wsnode.connect(false, 10);
    wsnode.connect = sinon.stub();
    clientStub.emit('error');
    clock.tick(10);

    should(cb.calledOnce).be.true();
    should(wsnode.listeners.error.length).be.eql(1);
    should(wsnode.retrying).be.false();
    should(wsnode.connect.calledOnce).be.false();
    clock.restore();
  });

  it('should call listeners on a "disconnect" event', () => {
    var cb = sinon.stub();

    wsnode.retrying = false;
    wsnode.onDisconnect(cb);
    should(wsnode.listeners.disconnect.length).be.eql(1);

    wsnode.connect();
    clientStub.emit('close');

    should(cb.calledOnce).be.true();
    should(wsnode.listeners.disconnect.length).be.eql(1);
  });

  it('should be able to register ephemeral callbacks on an event', () => {
    var
      cb = sinon.stub(),
      payload = {room: 'foobar'};

    wsnode.once('foobar', cb);
    wsnode.once('foobar', cb);
    wsnode.once('barfoo', cb);
    wsnode.connect();

    should(wsnode.listeners.foobar).match([{fn: cb, keep: false}, {fn: cb, keep: false}]);
    should(wsnode.listeners.barfoo).match([{fn: cb, keep: false}]);

    clientStub.emit('message', JSON.stringify(payload));

    should(wsnode.listeners.foobar).be.undefined();
    should(wsnode.listeners.barfoo).match([{fn: cb, keep: false}]);
    should(cb.calledTwice).be.true();
    should(cb.alwaysCalledWithMatch(payload)).be.true();
  });

  it('should be able to register persistent callbacks on an event', () => {
    var
      cb = sinon.stub(),
      payload = {room: 'foobar'};

    wsnode.on('foobar', cb);
    wsnode.on('foobar', cb);
    wsnode.connect();

    should(wsnode.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);

    clientStub.emit('message', JSON.stringify(payload));

    should(wsnode.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);
    should(cb.calledTwice).be.true();
    should(cb.alwaysCalledWithMatch(payload)).be.true();
  });

  it('should be able to unregister a callback on an event', () => {
    var
      cb = sinon.stub();

    wsnode.on('foobar', cb);
    wsnode.on('foobar', cb);
    wsnode.connect();

    should(wsnode.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);

    wsnode.off('foobar', cb);
    should(wsnode.listeners.foobar).match([{fn: cb, keep: true}]);

    wsnode.off('foobar', cb);
    should(wsnode.listeners.foobar).be.undefined();
  });

  it('should do nothing if trying to unregister an non-existent event/callback', () => {
    var
      cb = sinon.stub();

    wsnode.on('foobar', cb);
    wsnode.on('foobar', cb);
    wsnode.connect();

    should(wsnode.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);

    wsnode.off('foo', cb);
    should(wsnode.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);

    wsnode.off('foobar', sinon.stub());
    should(wsnode.listeners.foobar).match([{fn: cb, keep: true}, {fn: cb, keep: true}]);
  });

  it('should send data payload through websocket', () => {
    var data = {foo: 'bar'};

    clientStub.readyState = clientStub.OPEN = true;
    wsnode.connect();
    wsnode.send(data);

    should(clientStub.send.calledOnce).be.true();
    should(clientStub.send.calledWith(JSON.stringify(data))).be.true();
  });

  it('should discard messages if the socket is not ready', () => {
    var data = {foo: 'bar'};

    clientStub.readyState = 'foo';
    clientStub.OPEN = 'bar';
    wsnode.connect();
    wsnode.send(data);

    should(clientStub.send.called).be.false();
  });

  it('should properly close a connection when asked', () => {
    var
      cb = sinon.stub();

    wsnode.on('foobar', cb);
    wsnode.onConnect(cb);
    wsnode.onDisconnect(cb);
    wsnode.onConnectError(cb);
    wsnode.onReconnect(cb);
    wsnode.retrying = true;

    wsnode.connect();
    wsnode.close();

    should(wsnode.listeners.foobar).be.undefined();
    should(wsnode.listeners.error).be.empty();
    should(wsnode.listeners.connect).be.empty();
    should(wsnode.listeners.reconnect).be.empty();
    should(wsnode.listeners.disconnect).be.empty();
    should(wsnode.client).be.null();
    should(clientStub.close.called).be.true();
    should(wsnode.retrying).be.false();
  });
});
