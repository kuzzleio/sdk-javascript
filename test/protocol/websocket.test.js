const
  should = require('should'),
  sinon = require('sinon'),
  NodeWS = require('ws'),
  WS = require('../../src/protocols/websocket');

describe('WebSocket networking module', () => {
  let
    clock,
    websocket,
    wsargs,
    clientStub;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    clientStub = {
      send: sinon.stub(),
      close: sinon.stub()
    };

    window = 'foobar'; // eslint-disable-line
    WebSocket = function (...args) { // eslint-disable-line
      wsargs = args;
      return clientStub;
    };

    websocket = new WS('address', {
      port: 1234,
      autoReconnect: true,
      reconnectionDelay: 10
    });
  });

  afterEach(() => {
    clock.restore();
    WebSocket = undefined; // eslint-disable-line
    window = undefined;    // eslint-disable-line
  });

  it('should expose an unique identifier', () => {
    should(websocket.id).be.a.String();
  });

  it('should initialize protocol status when connecting', () => {
    websocket.connect();
    should(websocket.state).be.eql('connecting');
  });

  it('should initialize a WS connection properly', () => {
    clientStub.on = sinon.stub();
    websocket.connect();
    should(wsargs).match(['ws://address:1234']);
    should(clientStub.onopen).not.be.undefined();
    should(clientStub.onclose).not.be.undefined();
    should(clientStub.onerror).not.be.undefined();
    should(clientStub.onmessage).not.be.undefined();
  });

  it('should initialize a WS secure connection', () => {
    clientStub.on = sinon.stub();
    websocket = new WS('address', {
      port: 1234,
      autoReconnect: false,
      reconnectionDelay: 1234,
      sslConnection: true
    });
    websocket.connect();
    should(wsargs).match(['wss://address:1234']);
  });

  it('should call listeners on a "open" event', () => {
    const cb = sinon.stub();

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

  it('should change the state when the client connection is established', () => {
    websocket.state = 'connecting';

    websocket.connect();
    clientStub.onopen();
    should(websocket.state).be.eql('connected');
    should(websocket.wasConnected).be.true();
    should(websocket.stopRetryingToConnect).be.false();
  });

  it('should call listeners on a "reconnect" event', () => {
    const cb = sinon.stub();

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

  it('should try to reconnect on a connection error with autoReconnect = true', () => {
    const cb = sinon.stub();

    websocket.retrying = false;
    websocket.addListener('networkError', cb);
    should(websocket.listeners('networkError').length).be.eql(1);

    websocket.connect();
    websocket.connect = sinon.stub().rejects();
    clientStub.onopen();
    clientStub.onerror();
    should(websocket.retrying).be.true();
    clock.tick(10);

    should(cb).be.calledOnce();
    should(websocket.retrying).be.false();
    should(websocket.connect).be.calledOnce();
  });

  it('should not try to reconnect on a connection error with autoReconnect = false', () => {
    const cb = sinon.stub();

    websocket = new WS('address', {
      port: 1234,
      autoReconnect: false,
      reconnectionDelay: 10
    });

    websocket.retrying = false;
    websocket.addListener('networkError', cb);
    should(websocket.listeners('networkError').length).be.eql(1);

    const promise = websocket.connect();
    websocket.connect = sinon.stub();
    clientStub.onerror('foobar');
    clock.tick(10);

    should(cb).be.calledOnce();
    should(websocket.retrying).be.false();
    should(websocket.connect).not.be.called();

    return should(promise).be.rejectedWith('foobar');
  });

  it('should call listeners on a "disconnect" event', () => {
    const cb = sinon.stub();

    websocket.retrying = false;
    websocket.addListener('disconnect', cb);
    should(websocket.listeners('disconnect').length).be.eql(1);

    websocket.connect();
    clientStub.onclose(1000);

    clock.tick(10);
    should(cb).be.calledOnce();
    should(websocket.listeners('disconnect').length).be.eql(1);
  });

  it('should call error listeners on a "disconnect" event with an abnormal websocket code', () => {
    const cb = sinon.stub();

    websocket.retrying = false;
    websocket.addListener('networkError', cb);
    should(websocket.listeners('networkError').length).be.eql(1);

    websocket.connect();
    websocket.wasConnected = true;
    clientStub.onclose(4666, 'foobar');

    clock.tick(10);
    should(cb).be.calledOnce();
    should(cb.firstCall.args[0]).be.an.instanceOf(Error);
    should(cb.firstCall.args[0].internal.status).be.equal(4666);
    should(cb.firstCall.args[0].internal.message).be.equal('foobar');
    should(websocket.listeners('networkError').length).be.eql(1);

    cb.reset();
    websocket.connect();
    clientStub.onclose({code: 4666, reason: 'foobar'});

    clock.tick(10);
    should(cb).be.calledOnce();
    should(cb.firstCall.args[0]).be.an.instanceOf(Error);
    should(cb.firstCall.args[0].internal.status).be.equal(4666);
    should(cb.firstCall.args[0].internal.message).be.equal('foobar');
    should(websocket.listeners('networkError').length).be.eql(1);
  });

  it('should be able to register ephemeral callbacks on an event', () => {
    let
      cb1,
      cb2,
      cb3;

    websocket.once('foobar', function(arg) {cb1 = arg;});
    websocket.once('foobar', function(arg) {cb2 = arg;});
    websocket.once('barfoo', function(arg) {cb3 = arg;});
    websocket.connect();

    should(websocket.listeners('foobar').length).be.equal(2);
    should(websocket.listeners('barfoo').length).be.equal(1);

    const payload = {room: 'foobar'};
    clientStub.onmessage({data: JSON.stringify(payload)});

    clock.tick(10);
    should(websocket.listeners('foobar').length).be.exactly(0);
    should(websocket.listeners('barfoo').length).be.equal(1);
    should(cb1).match(payload);
    should(cb2).match(payload);
    should(cb3).be.undefined();
  });

  it('should be able to register persistent callbacks on an event', () => {
    let
      cb1,
      cb2;

    websocket.on('foobar', function(arg) {cb1 = arg;});
    websocket.on('foobar', function(arg) {cb2 = arg;});
    websocket.connect();

    should(websocket.listeners('foobar').length).be.equal(2);

    const payload = {room: 'foobar'};
    clientStub.onmessage({data: JSON.stringify(payload)});

    clock.tick(10);
    should(websocket.listeners('foobar').length).be.equal(2);
    should(cb1).match(payload);
    should(cb2).match(payload);
  });

  it('should send the message on room "discarded" if no room specified', () => {
    const
      cb = sinon.stub(),
      cb2 = sinon.stub();

    let expectedError;
    websocket.on('discarded', cb);
    websocket.on('queryError', (error, data) => {
      expectedError = error;
      cb2(error, data);
    });
    websocket.connect();

    const payload = { result: null, error: { message: 'Malformed request' } };

    clientStub.onmessage({data: JSON.stringify(payload)});
    clock.tick(10);

    should(cb)
      .be.calledOnce()
      .be.calledWithMatch(payload);
    should(cb2)
      .be.calledOnce()
      .be.calledWithMatch(expectedError, payload);
  });

  it('should be able to unregister a callback on an event', () => {
    const
      cb1 = sinon.stub(),
      cb2 = sinon.stub();

    websocket.on('foobar', cb1);
    websocket.on('foobar', cb2);
    websocket.connect();

    should(websocket.listeners('foobar').length).be.equal(2);

    websocket.removeListener('foobar', cb1);
    should(websocket.listeners('foobar').length).be.equal(1);

    websocket.removeListener('foobar', cb2);
    should(websocket.listeners('foobar').length).be.exactly(0);
  });

  it('should do nothing if trying to unregister an non-existent event/callback', () => {
    const
      cb1 = sinon.stub(),
      cb2 = sinon.stub();

    websocket.on('foobar', cb1);
    websocket.on('foobar', cb2);
    websocket.connect();

    should(websocket.listeners('foobar').length).be.equal(2);

    websocket.removeListener('foo', cb1);
    should(websocket.listeners('foobar').length).be.equal(2);

    websocket.removeListener('foobar', sinon.stub());
    should(websocket.listeners('foobar').length).be.equal(2);
  });

  it('should send data payload through websocket', () => {
    const data = {foo: 'bar'};

    clientStub.readyState = clientStub.OPEN = true;
    websocket.connect();
    websocket.send(data);

    should(clientStub.send).be.calledOnce();
    should(clientStub.send.calledWith(JSON.stringify(data))).be.true();
  });

  it('should discard messages if the socket is not ready', () => {
    const data = {foo: 'bar'};

    clientStub.readyState = 'foo';
    clientStub.OPEN = 'bar';
    websocket.connect();
    websocket.send(data);

    should(clientStub.send).not.be.called();
  });

  it('should properly close a connection when asked', () => {
    const cb = sinon.stub();

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

  describe('#constructor', () => {
    it('should throw if an invalid host is provided', () => {
      const invalidHosts = [undefined, null, 123, false, true, [], {}, ''];

      for (const host of invalidHosts) {
        should(() => new WS(host))
          .throw(Error, {message: 'host is required'});
      }
    });

    it('should fallback to the ws module if there is no global WebSocket API', () => {
      WebSocket = undefined; // eslint-disable-line
      window = undefined;    // eslint-disable-line

      const client = new WS('foobar');

      should(client.WebSocketClient).be.equal(NodeWS);
    });

    it('should have null options when using the browsers WebSocket API', () => {
      let client = new WS('foobar');

      should(client.WebSocketClient).equal(WebSocket);
      should(client.options).be.null();

      client = new WS('foobar', {headers: { 'X-foo': 'bar' }});
      should(client.WebSocketClient).equal(WebSocket);
      should(client.options).be.null();
    });

    it('should initialize pass allowed options to the ws ctor when using it', () => {
      WebSocket = undefined; // eslint-disable-line
      window = undefined;    // eslint-disable-line

      let client = new WS('foobar');

      should(client.WebSocketClient).equal(NodeWS);
      should(client.options).match({
        perMessageDeflate: false,
        headers: null
      });

      client = new WS('foobar', {headers: { 'X-foo': 'bar' }});
      should(client.WebSocketClient).equal(NodeWS);
      should(client.options).match({
        perMessageDeflate: false,
        headers: {
          'X-foo': 'bar'
        }
      });
    });

    it('should throw if invalid options are provided', () => {
      WebSocket = undefined; // eslint-disable-line
      window = undefined;    // eslint-disable-line

      const invalidHeaders = ['foo', 'false', 'true', 123, []];

      for (const headers of invalidHeaders) {
        should(() => new WS('foobar', {headers})).throw(Error, {message: 'Invalid "headers" option: expected an object'});
      }
    });
  });

  describe('#isReady', function() {
    it('should be ready if the instance is connected', () => {
      websocket.state = 'connected';
      should(websocket.isReady()).be.true();
    });

    it('should not be ready if the instance is offline', () => {
      websocket.state = 'offline';
      should(websocket.isReady()).be.false();
    });

    it('should not be ready if the instance is still connecting', () => {
      websocket.state = 'connecting';
      should(websocket.isReady()).be.false();
    });
  });
});
