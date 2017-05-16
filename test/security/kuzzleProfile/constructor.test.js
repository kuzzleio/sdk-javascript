var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/Kuzzle'),
  Profile = require('../../../src/security/Profile');

describe('Profile constructor', function () {
  var
    kuzzle;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
  });

  it('should throw an error if no id is provided', function() {
    should(function() { new Profile(kuzzle.security, null, null);}).throw(Error);
  });

  it('should initialize properties and return a valid Profile object', function () {
    var profile = new Profile(kuzzle.security, 'id', {some: 'content'});

    should(profile).be.instanceof(Profile);
    should(profile).have.propertyWithDescriptor('deleteActionName', { enumerable: false, writable: false, configurable: false });
    should(profile.deleteActionName).be.exactly('deleteProfile');
  });

  it('should expose functions', function () {
    var profile;

    kuzzle.bluebird = bluebird;
    profile = new Profile(kuzzle.security, 'test', {});

    should.exist(profile.save);
    should.exist(profile.addPolicy);
    should.exist(profile.savePromise);
    should.exist(profile.setPolicies);
    should.exist(profile.deletePromise);
    should.exist(profile.serialize);
  });

  it('should handle provided arguments correctly', function () {
    var profile = new Profile(kuzzle.security, 'test', {});

    should(profile).be.instanceof(Profile);
    should(profile.id).be.exactly('test');
    should(profile.content).be.empty();

    profile = new Profile(kuzzle.security, 'test', {some: 'content'});
    should(profile.id).be.exactly('test');
    should(profile.content).match({some: 'content'});
  });
});
