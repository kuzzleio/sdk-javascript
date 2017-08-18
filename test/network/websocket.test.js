var
  should = require('should'),
  sinon = require('sinon'),
  WS = require('../../src/networkWrapper/wrappers/websocket');

describe('WebSocket networking module', function () {
  var
    clock,
    websocket,
    wsargs,
    clientStub;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    clientStub = {
      send: sinon.stub(),
      close: sinon.stub()
    };

    window = 'foobar'; // eslint-disable-line
    WebSocket = function () { // eslint-disable-line
      wsargs = Array.prototype.slice.call(arguments);
      return clientStub;
    };

    websocket = new WS('address', {
      port: 1234,
      autoReconnect: 'autoReconnectValue',
      reconnectionDelay: 'reconnectionDelayValue'
    });
  });

  afterEach(function () {
    clock.restore();
    WebSocket = undefined; // eslint-disable-line
    window = undefined; // eslint-disable-line
  });

  it('should initialize network status when connecting', function () {
    websocket.connect();
    should(websocket.state).be.eql('connecting');
    should(websocket.queuing).be.false();
  });

  it('should start queuing if autoQueue option is set', function () {
    websocket.autoQueue = true;
    websocket.connect();
    should(websocket.queuing).be.true();
  });

  it('should initialize a WS connection properly', function () {
    clientStub.on = sinon.stub();
    websocket.connect();
    should(wsargs).match(['ws://address:1234']);
    should(clientStub.onopen).not.be.undefined();
    should(clientStub.onclose).not.be.undefined();
    should(clientStub.onerror).not.be.undefined();
    should(clientStub.onmessage).not.be.undefined();
  });

  it('should initialize a WS secure connection', function () {
    clientStub.on = sinon.stub();
    websocket.ssl = true;
    websocket.connect();
    should(wsargs).match(['wss://address:1234']);
  });

  it('should call listeners on a "open" event', function () {
    var cb = sinon.stub();

    should(websocket.listeners('connect').length).be.eql(0);
    should(websocket.listeners('reconnect').length).be.eql(0);

    websocket.retrying = false;
    websocket.addListener('connect', cb);
    should(websocket.listeners('connect').length).be.eql(1);
    should(websocket.listeners('reconnect').length).be.exactly(0);

    websocket.connect();
    clientStub.onopen();
    should(cb).be.calledOnce();
  });

  it('should change the state when the client connection is established', function () {
    websocket.state = 'connecting';

    websocket.connect();
    clientStub.onopen();
    should(websocket.state).be.eql('connected');
    should(websocket.wasConnected).be.true();
    should(websocket.stopRetryingToConnect).be.false();
  });

  it('should stop queuing when the client connection is established if autoQueue option is set', function () {
    websocket.queuing = true;
    websocket.autoQueue = true;

    websocket.connect();
    clientStub.onopen();
    should(websocket.queuing).be.false();
  });

  it('should not stop queuing when the client connection is established if autoQueue option is not set', function () {
    websocket.queuing = true;
    websocket.autoQueue = false;

    websocket.connect();
    clientStub.onopen();
    should(websocket.queuing).be.true();
  });

  it('should play the queue when the client connection is established if autoReplay option is set', function () {
    websocket.playQueue = sinon.stub();
    websocket.autoReplay = true;

    websocket.connect();
    clientStub.onopen();
    should(websocket.playQueue).be.calledOnce();
  });

  it('should not play the queue when the client connection is established if autoReplay option is not set', function () {
    websocket.playQueue = sinon.stub();
    websocket.autoReplay = false;

    websocket.connect();
    clientStub.onopen();
    should(websocket.playQueue).not.be.called();
  });

  it('should call listeners on a "reconnect" event', function () {
    var cb = sinon.stub();

    should(websocket.listeners('connect').length).be.eql(0);
    should(websocket.listeners('reconnect').length).be.eql(0);

    websocket.wasConnected = true;
    websocket.lasturl = 'ws://address:1234';
    websocket.addListener('reconnect', cb);
    should(websocket.listeners('connect').length).be.exactly(0);
    should(websocket.listeners('reconnect').length).be.eql(1);

    websocket.connect();
    clientStub.onopen();

    should(cb).be.calledOnce();
  });

  it('should try to reconnect on a connection error with autoReconnect = true', function () {
    var cb = sinon.stub();

    websocket.retrying = false;
    websocket.addListener('networkError', cb);
    should(websocket.listeners('networkError').length).be.eql(1);

    websocket.connect(true, 10);
    websocket.connect = sinon.stub();
    clientStub.onerror();
    should(websocket.retrying).be.true();
    clock.tick(10);

    should(cb).be.calledOnce();
    should(websocket.retrying).be.false();
    should(websocket.connect).be.calledOnce();
  });

  it('should not try to reconnect on a connection error with autoReconnect = false', function () {
    var cb = sinon.stub();

    websocket.autoReconnect = false;
    websocket.reconnectionDelay = 10;
    websocket.retrying = false;
    websocket.addListener('networkError', cb);
    should(websocket.listeners('networkError').length).be.eql(1);

    websocket.connect();
    websocket.connect = sinon.stub();
    clientStub.onerror();
    clock.tick(10);

    should(cb).be.calledOnce();
    should(websocket.retrying).be.false();
    should(websocket.connect).not.be.called();
  });

  it('should call listeners on a "disconnect" event', function () {
    var cb = sinon.stub();

    websocket.retrying = false;
    websocket.addListener('disconnect', cb);
    should(websocket.listeners('disconnect').length).be.eql(1);

    websocket.connect();
    clientStub.onclose(1000);

    clock.tick(10);
    should(cb).be.calledOnce();
    should(websocket.listeners('disconnect').length).be.eql(1);
  });

  it('should start queuing when the client is disconnected if autoQueue option is set', function () {
    websocket.queuing = false;
    websocket.autoQueue = true;

    websocket.connect();
    clientStub.onclose(1000);

    clock.tick(10);
    should(websocket.queuing).be.true();
  });

  it('should not start queuing when the client is disconnected if autoQueue option is not set', function () {
    websocket.queuing = false;
    websocket.autoQueue = false;

    websocket.connect();
    clientStub.onclose(1000);

    clock.tick(10);
    should(websocket.queuing).be.false();
  });

  it('should call error listeners on a "disconnect" event with an abnormal websocket code', function () {
    var cb = sinon.stub();

    websocket.retrying = false;
    websocket.addListener('networkError', cb);
    should(websocket.listeners('networkError').length).be.eql(1);

    websocket.connect();
    clientStub.onclose(4666, 'foobar');

    clock.tick(10);
    should(cb).be.calledOnce();
    should(cb.calledWith('foobar'));
    should(websocket.listeners('networkError').length).be.eql(1);

    cb.reset();
    websocket.connect();
    clientStub.onclose({code: 4666, reason: 'foobar'});

    clock.tick(10);
    should(cb).be.calledOnce();
    should(cb.calledWith('foobar'));
    should(websocket.listeners('networkError').length).be.eql(1);
  });

  it('should start queuing when the client is disconnected with an error, if autoQueue option is set', function () {
    websocket.queuing = false;
    websocket.autoQueue = true;

    websocket.connect();
    clientStub.onclose(4666, 'foobar');

    clock.tick(10);
    should(websocket.queuing).be.true();
  });

  it('should not start queuing when the client is disconnected with an error, if autoQueue option is not set', function () {
    websocket.queuing = false;
    websocket.autoQueue = false;

    websocket.connect();
    clientStub.onclose(4666, 'foobar');

    clock.tick(10);
    should(websocket.queuing).be.false();
  });

  it('should be able to register ephemeral callbacks on an event', function () {
    var
      cb1,
      cb2,
      cb3,
      payload = {room: 'foobar'};

    websocket.once('foobar', function(arg) {cb1 = arg;});
    websocket.once('foobar', function(arg) {cb2 = arg;});
    websocket.once('barfoo', function(arg) {cb3 = arg;});
    websocket.connect();

    should(websocket.listeners('foobar').length).be.equal(2);
    should(websocket.listeners('barfoo').length).be.equal(1);

    clientStub.onmessage({data: JSON.stringify(payload)});

    clock.tick(10);
    should(websocket.listeners('foobar').length).be.exactly(0);
    should(websocket.listeners('barfoo').length).be.equal(1);
    should(cb1).match(payload);
    should(cb2).match(payload);
    should(cb3).be.undefined();
  });

  it('should be able to register persistent callbacks on an event', function () {
    var
      cb1,
      cb2,
      payload = {room: 'foobar'};

    websocket.on('foobar', function(arg) {cb1 = arg;});
    websocket.on('foobar', function(arg) {cb2 = arg;});
    websocket.connect();

    should(websocket.listeners('foobar').length).be.equal(2);

    clientStub.onmessage({data: JSON.stringify(payload)});

    clock.tick(10);
    should(websocket.listeners('foobar').length).be.equal(2);
    should(cb1).match(payload);
    should(cb2).match(payload);
  });

  it('should send the message on room "discarded" if no room specified', function () {
    var
      cb = sinon.stub(),
      payload = {};

    websocket.on('discarded', cb);
    websocket.connect();

    clientStub.onmessage({data: JSON.stringify(payload)});

    clock.tick(10);
    should(cb).be.calledOnce();
    should(cb.alwaysCalledWithMatch(payload)).be.true();
  });

  it('should be able to unregister a callback on an event', function () {
    var
      cb1 = function(arg) {cb1 = arg;},
      cb2 = function(arg) {cb2 = arg;};

    websocket.on('foobar', cb1);
    websocket.on('foobar', cb2);
    websocket.connect();

    should(websocket.listeners('foobar').length).be.equal(2);

    websocket.off('foobar', cb1);
    should(websocket.listeners('foobar').length).be.equal(1);

    websocket.off('foobar', cb2);
    should(websocket.listeners('foobar').length).be.exactly(0);
  });

  it('should do nothing if trying to unregister an non-existent event/callback', function () {
    var
      cb1 = function(arg) {cb1 = arg;},
      cb2 = function(arg) {cb2 = arg;};

    websocket.on('foobar', cb1);
    websocket.on('foobar', cb2);
    websocket.connect();

    should(websocket.listeners('foobar').length).be.equal(2);

    websocket.off('foo', cb1);
    should(websocket.listeners('foobar').length).be.equal(2);

    websocket.off('foobar', sinon.stub());
    should(websocket.listeners('foobar').length).be.equal(2);
  });

  it('should send data payload through websocket', function () {
    var data = {foo: 'bar'};

    clientStub.readyState = clientStub.OPEN = true;
    websocket.connect();
    websocket.send(data);

    should(clientStub.send).be.calledOnce();
    should(clientStub.send.calledWith(JSON.stringify(data))).be.true();
  });

  it('should discard messages if the socket is not ready', function () {
    var data = {foo: 'bar'};

    clientStub.readyState = 'foo';
    clientStub.OPEN = 'bar';
    websocket.connect();
    websocket.send(data);

    should(clientStub.send).not.be.called();
  });

  it('should properly close a connection when asked', function () {
    var
      cb = sinon.stub();

    websocket.on('foobar', cb);
    websocket.addListener('connect', cb);
    websocket.addListener('disconnect', cb);
    websocket.addListener('networkError', cb);
    websocket.addListener('reconnect', cb);
    websocket.retrying = true;

    websocket.connect();
    websocket.close();

    should(websocket.listeners('foobar').length).be.exactly(0);
    should(websocket.listeners('networkError').length).be.exactly(0);
    should(websocket.listeners('connect').length).be.exactly(0);
    should(websocket.listeners('reconnect').length).be.exactly(0);
    should(websocket.listeners('disconnect').length).be.exactly(0);
    should(websocket.client).be.null();
    should(clientStub.close.called).be.true();
    should(websocket.wasConnected).be.false();
  });
});
