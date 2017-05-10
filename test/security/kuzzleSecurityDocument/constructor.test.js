var
  should = require('should'),
  Kuzzle = require('../../../src/Kuzzle'),
  SecurityDocument = require('../../../src/security/SecurityDocument');

describe('KuzzleSecurityDocument constructor', function () {
  var
    kuzzle;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
  });

  it('should throw an error if no id is provided', function () {
    should(function() { new SecurityDocument(kuzzle.security, null, null);}).throw(Error);
  });

  it('should expose securityDocument properties with the right permissions', function () {
    var securityDocument = new SecurityDocument(kuzzle.security, 'test', {});

    should(securityDocument).have.propertyWithDescriptor('kuzzle', { enumerable: false, writable: false, configurable: false });
    should(securityDocument).have.propertyWithDescriptor('Security', { enumerable: false, writable: false, configurable: false });
    should(securityDocument).have.propertyWithDescriptor('id', { enumerable: true, writable: false, configurable: false });
    should(securityDocument).have.propertyWithDescriptor('content', { enumerable: true, writable: true, configurable: false });
  });

  it('should expose functions', function () {
    var securityDocument = new SecurityDocument(kuzzle.security, 'test', {});

    should.exist(securityDocument.setContent);
    should.exist(securityDocument.serialize);
  });

  it('should handle provided arguments correctly', function () {
    var securityDocument = new SecurityDocument(kuzzle.security, 'test', {});

    should(securityDocument).be.instanceof(SecurityDocument);
    should(securityDocument.id).be.exactly('test');
    should(securityDocument.content).be.empty();

    securityDocument = new SecurityDocument(kuzzle.security, 'test', {some: 'content'});
    should(securityDocument.id).be.exactly('test');
    should(securityDocument.content).match({some: 'content'});
  });
});
