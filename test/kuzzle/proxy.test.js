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
    }).throwError('setting a not defined \'jvt\' properties in \'kuzzle\' object');    
  });

});
