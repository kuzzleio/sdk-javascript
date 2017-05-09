var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/Kuzzle'),
  Security = require('../../../src/security/Security');

describe('Security constructor', function () {
  it('should initialize properties and return a valid Security object', function () {
    var
      kuzzle = new Kuzzle('foo');

    should(kuzzle.security).be.instanceof(Security);
    should(kuzzle.security).have.propertyWithDescriptor('kuzzle', { enumerable: false, writable: false, configurable: false });
    should(kuzzle.security).have.propertyWithDescriptor('buildQueryArgs', { enumerable: false, writable: false, configurable: false });
    should(kuzzle.security.kuzzle).be.exactly(kuzzle);
  });

  it('should promisify the right functions', function () {
    var
      kuzzle;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('foo');

    should.exist(kuzzle.security.createRolePromise);
    should.exist(kuzzle.security.fetchRolePromise);
    should.exist(kuzzle.security.searchRolesPromise);
    should.exist(kuzzle.security.deleteRolePromise);
    should.exist(kuzzle.security.createProfilePromise);
    should.exist(kuzzle.security.fetchProfilePromise);
    should.exist(kuzzle.security.searchProfilesPromise);
    should.exist(kuzzle.security.deleteProfilePromise);
    should.exist(kuzzle.security.createUserPromise);
    should.exist(kuzzle.security.fetchUserPromise);
    should.exist(kuzzle.security.searchUsersPromise);
    should.exist(kuzzle.security.deleteUserPromise);

    should.not.exist(kuzzle.security.roleFactoryPromise);
    should.not.exist(kuzzle.security.profileFactoryPromise);
    should.not.exist(kuzzle.security.userFactoryPromise);
  });
});
