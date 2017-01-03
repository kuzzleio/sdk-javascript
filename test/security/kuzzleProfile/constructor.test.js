var
  should = require('should'),
  bluebird = require('bluebird'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../../src/Kuzzle'),
  Profile = require('../../../src/security/Profile');

describe('Profile constructor', function () {
  var
    kuzzle;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  });

  it('should throw an error if no id is provided', function(done) {
    try {
      new Profile(kuzzle.security, null, null);
    }
    catch (e) {
      should(e).be.Error();
      return done();
    }

    return done(new Error('Constructor doesn\'t throw an Error'));
  });

  it('should initialize properties and return a valid Profile object', function () {
    var
      profile;

    kuzzle = new Kuzzle('foo');
    profile = new Profile(kuzzle.security, 'id', {some: 'content'});

    should(profile).be.instanceof(Profile);
    should(profile).have.propertyWithDescriptor('deleteActionName', { enumerable: false, writable: false, configurable: false });
    should(profile.deleteActionName).be.exactly('deleteProfile');
  });

  it('should expose functions', function () {
    var profile = new Profile(kuzzle.security, 'test', {});

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
