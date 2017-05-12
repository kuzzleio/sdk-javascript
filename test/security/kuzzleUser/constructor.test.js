var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/Kuzzle'),
  User = require('../../../src/security/User');

describe('User constructor', function () {
  var
    kuzzle;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
  });

  it('should throw an error if no id is provided', function () {
    should(function() { new User(kuzzle.security, null, null);}).throw(Error);
  });

  it('should initialize properties and return a valid User object', function () {
    var kuzzleUser = new User(kuzzle.security, 'id', {some: 'content'});

    should(kuzzleUser).be.instanceof(User);
    should(kuzzleUser).have.propertyWithDescriptor('deleteActionName', { enumerable: false, writable: false, configurable: false });
    should(kuzzleUser.deleteActionName).be.exactly('deleteUser');
  });

  it('should expose functions', function () {
    var kuzzleUser;

    kuzzle.bluebird = bluebird;
    kuzzleUser = new User(kuzzle.security, 'test', {});

    should.exist(kuzzleUser.setProfiles);
    should.exist(kuzzleUser.createPromise);
    should.exist(kuzzleUser.replacePromise);
    should.exist(kuzzleUser.serialize);
    should.exist(kuzzleUser.deletePromise);
  });

  it('should handle provided arguments correctly', function () {
    var kuzzleUser = new User(kuzzle.security, 'test', {});

    should(kuzzleUser).be.instanceof(User);
    should(kuzzleUser.id).be.exactly('test');
    should(kuzzleUser.content).be.empty();

    kuzzleUser = new User(kuzzle.security, 'test', {some: 'content'});
    should(kuzzleUser.id).be.exactly('test');
    should(kuzzleUser.content).match({some: 'content'});
  });
});
