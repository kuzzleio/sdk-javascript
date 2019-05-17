const
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle'),
  AuthController = require('../../src/controllers/auth'),
  BulkController = require('../../src/controllers/bulk'),
  CollectionController = require('../../src/controllers/collection'),
  DocumentController = require('../../src/controllers/document'),
  IndexController = require('../../src/controllers/index'),
  MemoryStorageController = require('../../src/controllers/memoryStorage'),
  SecurityController = require('../../src/controllers/security'),
  ServerController = require('../../src/controllers/server'),
  RealTimeController = require('../../src/controllers/realtime'),
  {
    SocketIO,
    WebSocket,
    Http
  } = require('../../src/protocols'),
  ProtocolMock = require('../mocks/protocol.mock');

describe('Kuzzle proxy', () => {
  let warn;

  before(() => {
    warn = console.warn;
    console.warn = sinon.stub();
  });

  after(() => {
    console.warn = warn;
  });

  const protocolMock = new ProtocolMock('somewhere');

  it('should throw an error if one tries to set unvalid properties', () => {
    const kuzzle = new Kuzzle(protocolMock);
    kuzzle.jvt = 'foobar';
    should(console.warn).be.calledOnce();
  });

});
