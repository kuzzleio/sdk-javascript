const
  should = require('should'),
  Kuzzle = require('../../src/Kuzzle'),
  ProtocolMock = require('../mocks/protocol.mock');

describe('Kuzzle proxy', () => {
  const protocolMock = new ProtocolMock('somewhere');

  it('should throw an error if one tries to set invalid properties', () => {
    const kuzzle = new Kuzzle(protocolMock);
    should(() => {
      kuzzle.jvt = 'foobar';
    }).throwError('Cannot set a value to the undefined \'jvt\' property in \'kuzzle\'');    
  });

});
