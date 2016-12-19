var
  should = require('should'),
  bluebird = require('bluebird'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../../src/kuzzle'),
  Profile = require('../../../src/security/kuzzleProfile');

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
      kuzzleProfile;

    kuzzle = new Kuzzle('foo');
    kuzzleProfile = new Profile(kuzzle.security, 'id', {some: 'content'});

    should(kuzzleProfile).be.instanceof(Profile);
    should(kuzzleProfile).have.propertyWithDescriptor('deleteActionName', { enumerable: false, writable: false, configurable: false });
    should(kuzzleProfile.deleteActionName).be.exactly('deleteProfile');
  });

  it('should expose functions', function () {
    var kuzzleProfile = new Profile(kuzzle.security, 'test', {});

    should.exist(kuzzleProfile.save);
    should.exist(kuzzleProfile.addPolicy);
    should.exist(kuzzleProfile.savePromise);
    should.exist(kuzzleProfile.setPolicies);
    should.exist(kuzzleProfile.deletePromise);
    should.exist(kuzzleProfile.serialize);
  });

  it('should handle provided arguments correctly', function () {
    var kuzzleProfile = new Profile(kuzzle.security, 'test', {});

    should(kuzzleProfile).be.instanceof(Profile);
    should(kuzzleProfile.id).be.exactly('test');
    should(kuzzleProfile.content).be.empty();

    kuzzleProfile = new Profile(kuzzle.security, 'test', {some: 'content'});
    should(kuzzleProfile.id).be.exactly('test');
    should(kuzzleProfile.content).match({some: 'content'});
  });
});
