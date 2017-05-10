var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/Kuzzle'),
  Role = require('../../../src/security/Role');

describe('Role constructor', function () {
  var
    kuzzle;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
  });

  it('should throw an error if no id is provided', function () {
    should(function() { new Role(kuzzle.security, null, null);}).throw(Error);
  });

  it('should initialize properties and return a valid Role object', function () {
    var role = new Role(kuzzle.security, 'id', {some: 'content'});

    should(role).be.instanceof(Role);
    should(role).have.propertyWithDescriptor('deleteActionName', { enumerable: false, writable: false, configurable: false });
    should(role.deleteActionName).be.exactly('deleteRole');
  });

  it('should expose functions', function () {
    var role;

    kuzzle.bluebird = bluebird;
    role = new Role(kuzzle.security, 'test', {});

    should.exist(role.setContent);
    should.exist(role.serialize);
    should.exist(role.savePromise);
    should.exist(role.deletePromise);
  });

  it('should handle provided arguments correctly', function () {
    var role = new Role(kuzzle.security, 'test', {});

    should(role).be.instanceof(Role);
    should(role.id).be.exactly('test');
    should(role.content).be.empty();

    role = new Role(kuzzle.security, 'test', {some: 'content'});
    should(role.id).be.exactly('test');
    should(role.content).match({some: 'content'});
  });
});
