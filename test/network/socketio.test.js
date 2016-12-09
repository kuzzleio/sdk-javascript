var
  should = require('should'),
  sinon = require('sinon'),
  SocketIO = require('../../src/networkWrapper/wrappers/socketio');

/**
 * @global window
 */

describe('SocketIO networking module', () => {
  var
    socketIO,
    socketStub;

  beforeEach(() => {
    socketStub = {
      once: sinon.stub(),
      on: sinon.stub(),
      off: sinon.stub(),
      emit: sinon.stub(),
      close: sinon.stub()
    };

    socketIO = new SocketIO('address', 'port', false);
    socketIO.socket = socketStub;
  });

  it('should connect with the right parameters', () => {
    window = {io: sinon.stub()};
    socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');
    should(window.io.calledOnce).be.true();
    should(window.io.calledWithMatch('http://address:port', {
      reconnection: 'autoReconnectValue',
      reconnectionDelay: 'reconnectionDelayValue',
      forceNew: true
    })).be.true();

    window = undefined;
  });

  it('should connect with the secure connection', () => {
    window = {io: sinon.stub()};
    socketIO.ssl = true;
    socketIO.connect('autoReconnectValue', 'reconnectionDelayValue');
    should(window.io.calledWithMatch('https://address:port', {
      reconnection: 'autoReconnectValue',
      reconnectionDelay: 'reconnectionDelayValue',
      forceNew: true
    })).be.true();

    window = undefined;
  });

  it('should plug onConnect callbacks to the right event', () => {
    var cb = () => {};
    socketIO.onConnect(cb);
    should(socketStub.on.calledOnce).be.true();
    should(socketStub.on.calledWith('connect', cb)).be.true();
  });

  it('should plug onConnectError callbacks to the right event', () => {
    var cb = () => {};
    socketIO.onConnectError(cb);
    should(socketStub.on.calledOnce).be.true();
    should(socketStub.on.calledWith('connect_error', cb)).be.true();
  });

  it('should plug onDisconnect callbacks to the right event', () => {
    var cb = () => {};
    socketIO.onDisconnect(cb);
    should(socketStub.on.calledOnce).be.true();
    should(socketStub.on.calledWith('disconnect', cb)).be.true();
  });

  it('should plug onReconnect callbacks to the right event', () => {
    var cb = () => {};
    socketIO.onReconnect(cb);
    should(socketStub.on.calledOnce).be.true();
    should(socketStub.on.calledWith('reconnect', cb)).be.true();
  });

  it('should be able to listen to an event just once', () => {
    var cb = () => {};
    socketIO.once('event', cb);
    should(socketStub.once.calledOnce).be.true();
    should(socketStub.once.calledWith('event', cb)).be.true();
  });

  it('should be able to listen to an event', () => {
    var cb = () => {};
    socketIO.on('event', cb);
    should(socketStub.on.calledOnce).be.true();
    should(socketStub.on.calledWith('event', cb)).be.true();
  });

  it('should be able to remove an event listener', () => {
    var cb = () => {};
    socketIO.off('event', cb);
    should(socketStub.off.calledOnce).be.true();
    should(socketStub.off.calledWith('event', cb)).be.true();
  });

  it('should be able to send a payload', () => {
    socketIO.send('some data');
    should(socketStub.emit.calledOnce).be.true();
    should(socketStub.emit.calledWith('kuzzle', 'some data')).be.true();
  });

  it('should be able to be closed', () => {
    socketIO.close();
    should(socketStub.close.calledOnce).be.true();
    should(socketIO.socket).be.null();
  });
});
