var
  should = require('should'),
  bluebird = require('bluebird'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../../src/kuzzle'),
  User = require('../../../src/security/kuzzleUser');

describe('User constructor', function () {
  var
    kuzzle;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  });

  it('should throw an error if no id is provided', function (done) {
    try {
      new User(kuzzle.security, null, null);
    }
    catch (e) {
      should(e).be.Error();
      return done();
    }

    return done(new Error('Constructor doesn\'t throw an Error'));
  });

  it('should initialize properties and return a valid Profile object', function () {
    var
      kuzzleUser;

    kuzzle = new Kuzzle('foo');
    kuzzleUser = new User(kuzzle.security, 'id', {some: 'content'});

    should(kuzzleUser).be.instanceof(User);
    should(kuzzleUser).have.propertyWithDescriptor('deleteActionName', { enumerable: false, writable: false, configurable: false });
    should(kuzzleUser.deleteActionName).be.exactly('deleteUser');
  });

  it('should expose functions', function () {
    var kuzzleUser = new User(kuzzle.security, 'test', {});

    should.exist(kuzzleUser.setProfiles);
    should.exist(kuzzleUser.savePromise);
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
