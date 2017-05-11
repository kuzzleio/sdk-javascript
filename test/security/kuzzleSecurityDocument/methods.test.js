var
  should = require('should'),
  Kuzzle = require('../../../src/Kuzzle'),
  SecurityDocument = require('../../../src/security/SecurityDocument');

describe('KuzzleSecurityDocument methods', function () {
  var
    securityDocument,
    kuzzle = new Kuzzle('foo', {connect: 'manual'});

  describe('#toJSON', function () {
    before(function () {
      securityDocument = new SecurityDocument(kuzzle.security, 'myId', {some: 'content'});
    });

    it('should serialize itself properly', function () {
      var
        serialized = securityDocument.serialize();

      should(serialized._id).be.exactly('myId');
      should(serialized.body).match({some: 'content'});
    });
  });


  describe('#setContent', function () {
    before(function () {
      securityDocument = new SecurityDocument(kuzzle.security, 'myId', {some: 'content'});
    });

    it('should replace the current security document', function () {
      var serialized;

      securityDocument.setContent({other: 'content'});
      serialized = securityDocument.serialize();

      should(serialized.body).match({other: 'content'});
    });
  });
});
