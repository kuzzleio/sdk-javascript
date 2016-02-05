var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../../src/kuzzle'),
  KuzzleSecurity = rewire('../../../src/security/kuzzleSecurity');

describe('kuzzleSecurity constructor', function () {
  it('should initialize properties and return a valid kuzzleSecurity object', function () {
    var
      kuzzle = new Kuzzle('foo'),
      security;

    security = new KuzzleSecurity(kuzzle);

    should(security).be.instanceof(KuzzleSecurity);
    should(security).have.propertyWithDescriptor('kuzzle', { enumerable: false, writable: false, configurable: false });
    should(security).have.propertyWithDescriptor('buildQueryArgs', { enumerable: false, writable: false, configurable: false });
    should(security.kuzzle).be.exactly(kuzzle);
  });

  it('should promisify the right functions', () => {
    var
      kuzzle,
      security;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('foo');
    security = new KuzzleSecurity(kuzzle, 'foo', 'bar');

    should.exist(security.createRolePromise);
    should.exist(security.getRolePromise);
    should.exist(security.searchRolesPromise);
    should.exist(security.deleteRolePromise);
    should.exist(security.createProfilePromise);
    should.exist(security.getProfilePromise);
    should.exist(security.searchProfilesPromise);
    should.exist(security.deleteProfilePromise);
    should.exist(security.createUserPromise);
    should.exist(security.getUserPromise);
    should.exist(security.searchUsersPromise);
    should.exist(security.deleteUserPromise);

    should.not.exist(security.roleFactoryPromise);
    should.not.exist(security.profileFactoryPromise);
    should.not.exist(security.userFactoryPromise);
  });
});