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
  const protocolMock = new ProtocolMock('somewhere');

  it('should throw an error if one tries to set invalid properties', () => {
    const kuzzle = new Kuzzle(protocolMock);
    should.throws(() => {
      kuzzle.jvt = 'foobar';
    });
  });

});
