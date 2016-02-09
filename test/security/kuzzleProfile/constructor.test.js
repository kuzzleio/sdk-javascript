var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleSecurityDocument = require('../../../src/security/kuzzleSecurityDocument'),
  KuzzleProfile = require('../../../src/security/kuzzleProfile');

describe('KuzzleRole constructor', function () {
  var
    kuzzle;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  });

  it('should throw an error if no id is provided', done => {
    try {
      new KuzzleProfile(kuzzle.security, null, null);
    }
    catch (e) {
      should(e).be.Error();
      return done();
    }

    return done(new Error('Constructor doesn\'t throw an Error'));
  });

  it('should initialize properties and return a valid KuzzleProfile object', function () {
    var
      kuzzle = new Kuzzle('foo'),
      kuzzlePorfile = new KuzzleProfile(kuzzle.security, 'id', {some: 'content'});


    should(kuzzlePorfile).be.instanceof(KuzzleProfile);
    should(kuzzlePorfile).have.propertyWithDescriptor('deleteActionName', { enumerable: false, writable: false, configurable: false });
    should(kuzzlePorfile.deleteActionName).be.exactly('deleteProfile');
  });

  it('should expose functions', function () {
    var kuzzlePorfile = new KuzzleProfile(kuzzle.security, 'test', {});

    should.exist(kuzzlePorfile.save);
    should.exist(kuzzlePorfile.addRole);
    should.exist(kuzzlePorfile.savePromise);
    should.exist(kuzzlePorfile.setRoles);
    should.exist(kuzzlePorfile.hydratePromise);
    should.exist(kuzzlePorfile.serialize);
  });

  it('should handle provided arguments correctly', function () {
    var kuzzleProfile = new KuzzleProfile(kuzzle.security, 'test', {});

    should(kuzzleProfile).be.instanceof(KuzzleProfile);
    should(kuzzleProfile.id).be.exactly('test');
    should(kuzzleProfile.content).be.empty();

    kuzzleProfile = new KuzzleProfile(kuzzle.security, 'test', {some: 'content'});
    should(kuzzleProfile.id).be.exactly('test');
    should(kuzzleProfile.content).match({some: 'content'});
  });
});