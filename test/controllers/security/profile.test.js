const
  Profile = require('../../../src/controllers/security/profile'),
  sinon = require('sinon'),
  should = require('should');

describe('security/profile', () => {
  let profile;

  beforeEach(() => {
    profile = new Profile({
      security: {
        mGetRoles: sinon.stub().resolves([
          {_id: 'role1', controllers: ['foo', 'bar']},
          {_id: 'role2', controllers: ['foo', 'baz']}
        ])
      }
    });
  });

  describe('getRoles', () => {
    it('should return a Promise which resolves to an empty array if no profile is attached', () => {
      return profile.getRoles()
        .then(roles => {
          should(profile.kuzzle.security.mGetRoles).not.be.called();
          should(roles).be.an.Array().and.be.empty();
        });
    });

    it('should fetch the attached roles using the API to build Roles objects', () => {
      profile.policies = [
        {roleId: 'role1', restrictions: ['i', 'want', 'to']},
        {roleId: 'role2', restrictions: ['break', 'free']}
      ];

      return profile.getRoles()
        .then(roles => {
          should(profile.kuzzle.security.mGetRoles)
            .be.calledOnce()
            .be.calledWith(['role1', 'role2']);

          should(roles).be.an.Array();
          should(roles[0]).match({_id: 'role1', controllers: ['foo', 'bar']});
          should(roles[1]).match({_id: 'role2', controllers: ['foo', 'baz']});
        });
    });
  });
});