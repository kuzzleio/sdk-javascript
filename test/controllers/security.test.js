const
  SecurityController = require('../../src/controllers/security'),
  Profile = require('../../src/controllers/security/profile'),
  Role = require('../../src/controllers/security/role'),
  User = require('../../src/controllers/security/user'),
  ProfileSearchResult = require('../../src/controllers/searchResult/profile'),
  RoleSearchResult = require('../../src/controllers/searchResult/role'),
  UserSearchResult = require('../../src/controllers/searchResult/user'),
  sinon = require('sinon'),
  should = require('should');

describe('Security Controller', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      emit: sinon.stub(),
      query: sinon.stub()
    };
    kuzzle.security = new SecurityController(kuzzle);
  });

  describe('createCredentials', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.createCredentials('strategy', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.createCredentials: _id is required');
    });

    it('should throw an error if the "strategy" argument is not provided', () => {
      should(function () {
        kuzzle.security.createCredentials(undefined, 'kuid', {foo: 'bar'}, options);
      }).throw('Kuzzle.security.createCredentials: strategy is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.createCredentials('strategy', 'kuid', undefined, options);
      }).throw('Kuzzle.security.createCredentials: body is required');
    });

    it('should call security/createCredentials query with the user credentials and return a Promise which resolves a json object', () => {
      const result = {
        username: 'foo',
        kuid: 'kuid'
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.createCredentials('strategy', 'kuid', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              strategy: 'strategy',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createCredentials'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('createFirstAdmin', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.createFirstAdmin(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.createFirstAdmin: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.createFirstAdmin('kuid', undefined, options);
      }).throw('Kuzzle.security.createFirstAdmin: body is required');
    });

    it('should call security/createFirstAdmin query with the first admin content and credentials and return a Promise which resolves the created user object', () => {
      kuzzle.query.resolves({
        _id: 'id',
        _source: {
          name: 'Doe',
          profileIds: ['admin']
        }
      });

      return kuzzle.security.createFirstAdmin('kuid', {foo: 'bar'}, options)
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createFirstAdmin',
              reset: undefined
            }, options);

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('id');
          should(user.content).be.eql({name: 'Doe', profileIds: ['admin']});
          should(user.profileIds).be.eql(['admin']);
        });
    });

    it('should inject the "reset" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'id',
        _source: {
          name: 'Doe',
          profileIds: ['admin']
        }
      });

      return kuzzle.security.createFirstAdmin('kuid', {foo: 'bar'}, {reset: true})
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createFirstAdmin',
              reset: true
            }, {});

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('id');
          should(user.content).be.eql({name: 'Doe', profileIds: ['admin']});
          should(user.profileIds).be.eql(['admin']);
        });
    });
  });

  describe('createOrReplaceProfile', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.createOrReplaceProfile(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.createOrReplaceProfile: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.createOrReplaceProfile('profileId', undefined, options);
      }).throw('Kuzzle.security.createOrReplaceProfile: body is required');
    });

    it('should call security/createOrReplaceProfile query with the profile content and return a Promise which resolves a Profile object', () => {
      kuzzle.query.resolves({
        _id: 'profileId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 1,
        _source: {
          policies: ['foo', 'bar']
        },
        created: false
      });

      return kuzzle.security.createOrReplaceProfile('profileId', {foo: 'bar'}, options)
        .then(profile => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createOrReplaceProfile',
              refresh: undefined
            }, options);

          should(profile).be.an.instanceOf(Profile);
          should(profile._id).be.eql('profileId');
          should(profile.policies).be.eql(['foo', 'bar']);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'profileId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 1,
        _source: {
          policies: ['foo', 'bar']
        },
        created: false
      });

      return kuzzle.security.createOrReplaceProfile('profileId', {foo: 'bar'}, {refresh: true})
        .then(profile => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createOrReplaceProfile',
              refresh: true
            }, {});

          should(profile).be.an.instanceOf(Profile);
          should(profile._id).be.eql('profileId');
          should(profile.policies).be.eql(['foo', 'bar']);
        });
    });
  });

  describe('createOrReplaceRole', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.createOrReplaceRole(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.createOrReplaceRole: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.createOrReplaceRole('roleId', undefined, options);
      }).throw('Kuzzle.security.createOrReplaceRole: body is required');
    });

    it('should call security/createOrReplaceRole query with the role content and return a Promise which resolves a Role object', () => {
      kuzzle.query.resolves({
        _id: 'roleId',
        _index: '%kuzzle',
        _type: 'roles',
        _version: 1,
        _source: {
          controllers: {foo: {actions: {bar: true}}}
        },
        created: false
      });

      return kuzzle.security.createOrReplaceRole('roleId', {foo: 'bar'}, options)
        .then(role => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'roleId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createOrReplaceRole',
              refresh: undefined
            }, options);

          should(role).be.an.instanceOf(Role);
          should(role._id).be.eql('roleId');
          should(role.controllers).be.eql({foo: {actions: {bar: true}}});
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'roleId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 1,
        _source: {
          controllers: {foo: {actions: {bar: true}}}
        },
        created: false
      });

      return kuzzle.security.createOrReplaceRole('roleId', {foo: 'bar'}, {refresh: true})
        .then(role => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'roleId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createOrReplaceRole',
              refresh: true
            }, {});

          should(role).be.an.instanceOf(Role);
          should(role._id).be.eql('roleId');
          should(role.controllers).be.eql({foo: {actions: {bar: true}}});
        });
    });
  });

  describe('createProfile', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.createProfile(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.createProfile: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.createProfile('profileId', undefined, options);
      }).throw('Kuzzle.security.createProfile: body is required');
    });

    it('should call security/createProfile query with the profile content and return a Promise which resolves a Profile object', () => {
      kuzzle.query.resolves({
        _id: 'profileId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 1,
        _source: {
          policies: ['foo', 'bar']
        },
        created: true
      });

      return kuzzle.security.createProfile('profileId', {foo: 'bar'}, options)
        .then(profile => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createProfile',
              refresh: undefined
            }, options);

          should(profile).be.an.instanceOf(Profile);
          should(profile._id).be.eql('profileId');
          should(profile.policies).be.eql(['foo', 'bar']);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'profileId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 1,
        _source: {
          policies: ['foo', 'bar']
        },
        created: true
      });

      return kuzzle.security.createProfile('profileId', {foo: 'bar'}, {refresh: true})
        .then(profile => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createProfile',
              refresh: true
            }, {});

          should(profile).be.an.instanceOf(Profile);
          should(profile._id).be.eql('profileId');
          should(profile.policies).be.eql(['foo', 'bar']);
        });
    });
  });

  describe('createRole', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.createRole(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.createRole: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.createRole('roleId', undefined, options);
      }).throw('Kuzzle.security.createRole: body is required');
    });

    it('should call security/createRole query with the role content and return a Promise which resolves a Role object', () => {
      kuzzle.query.resolves({
        _id: 'roleId',
        _index: '%kuzzle',
        _type: 'roles',
        _version: 1,
        _source: {
          controllers: {foo: {actions: {bar: true}}}
        },
        created: true
      });

      return kuzzle.security.createRole('roleId', {foo: 'bar'}, options)
        .then(role => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'roleId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createRole',
              refresh: undefined
            }, options);

          should(role).be.an.instanceOf(Role);
          should(role._id).be.eql('roleId');
          should(role.controllers).be.eql({foo: {actions: {bar: true}}});
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'roleId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 1,
        _source: {
          controllers: {foo: {actions: {bar: true}}}
        },
        created: true
      });

      return kuzzle.security.createRole('roleId', {foo: 'bar'}, {refresh: true})
        .then(role => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'roleId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'createRole',
              refresh: true
            }, {});

          should(role).be.an.instanceOf(Role);
          should(role._id).be.eql('roleId');
          should(role.controllers).be.eql({foo: {actions: {bar: true}}});
        });
    });
  });

  describe('createUser', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      const body = {
        content: {foo: 'bar'},
        credentials: {
          strategy: {foo: 'bar'}
        }
      };
      should(function () {
        kuzzle.security.createUser(undefined, body, options);
      }).throw('Kuzzle.security.createUser: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.createUser('userId', undefined, options);
      }).throw('Kuzzle.security.createUser: body is required');
    });

    it('should throw an error if "body.content" is not provided', () => {
      const body = {
        credentials: {
          strategy: {foo: 'bar'}
        }
      };
      should(function () {
        kuzzle.security.createUser('userId', body, options);
      }).throw('Kuzzle.security.createUser: body.content is required');
    });

    it('should throw an error if "body.credentials" is not provided', () => {
      const body = {
        content: {foo: 'bar'}
      };
      should(function () {
        kuzzle.security.createUser('userId', body, options);
      }).throw('Kuzzle.security.createUser: body.credentials is required');
    });

    it('should call security/createUser query with the user content and credentials and return a Promise which resolves a User object', () => {
      const body = {
        content: {foo: 'bar'},
        credentials: {
          strategy: {foo: 'bar'}
        }
      };

      kuzzle.query.resolves({
        _id: 'kuid',
        _index: '%kuzzle',
        _source: {
          profileIds: ['profileId'],
          name: 'John Doe',
        },
        _type: 'users',
        _version: 1,
        created: true
      });

      return kuzzle.security.createUser('userId', body, options)
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'userId',
              body,
              controller: 'security',
              action: 'createUser',
              refresh: undefined
            }, options);

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('kuid');
          should(user.content).be.eql({name: 'John Doe', profileIds: ['profileId']});
          should(user.profileIds).be.eql(['profileId']);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const body = {
        content: {foo: 'bar'},
        credentials: {
          strategy: {foo: 'bar'}
        }
      };

      kuzzle.query.resolves({
        _id: 'kuid',
        _index: '%kuzzle',
        _source: {
          profileIds: ['profileId'],
          name: 'John Doe',
        },
        _type: 'users',
        _version: 1,
        created: true
      });

      return kuzzle.security.createUser('userId', body, {refresh: true})
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'userId',
              body,
              controller: 'security',
              action: 'createUser',
              refresh: true
            }, {});

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('kuid');
          should(user.content).be.eql({name: 'John Doe', profileIds: ['profileId']});
          should(user.profileIds).be.eql(['profileId']);
        });
    });
  });

  describe('deleteCredentials', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.deleteCredentials('strategy', undefined, options);
      }).throw('Kuzzle.security.deleteCredentials: _id is required');
    });

    it('should throw an error if the "strategy" argument is not provided', () => {
      should(function () {
        kuzzle.security.deleteCredentials(undefined, 'kuid', {foo: 'bar'}, options);
      }).throw('Kuzzle.security.deleteCredentials: strategy is required');
    });

    it('should call security/deleteCredentials query and return a Promise which resolves an acknowledgement', () => {
      const result = {
        acknowledged: true
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.deleteCredentials('strategy', 'kuid', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              strategy: 'strategy',
              controller: 'security',
              action: 'deleteCredentials'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('deleteProfile', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.deleteProfile(undefined, options);
      }).throw('Kuzzle.security.deleteProfile: _id is required');
    });

    it('should call security/deleteProfile query and return a Promise which resolves the deleted profile id', () => {
      const result = {
        _id: 'profileId'
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.deleteProfile('profileId', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              controller: 'security',
              action: 'deleteProfile'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('deleteRole', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.deleteRole(undefined, options);
      }).throw('Kuzzle.security.deleteRole: _id is required');
    });

    it('should call security/deleteRole query and return a Promise which resolves the deleted role id', () => {
      const result = {
        _id: 'roleId'
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.deleteRole('roleId', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'roleId',
              controller: 'security',
              action: 'deleteRole'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('deleteUser', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.deleteUser(undefined, options);
      }).throw('Kuzzle.security.deleteUser: _id is required');
    });

    it('should call security/deleteUser query and return a Promise which resolves the deleted user id', () => {
      const result = {
        _id: 'kuid'
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.deleteUser('kuid', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              controller: 'security',
              action: 'deleteUser'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('getAllCredentialFields', () => {
    it('should call security/getAllCredentialFields query and return a Promise which resolves the list of credendial fields', () => {
      const result = {
        local: ['username', 'password'],
        foo: ['bar']
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.getAllCredentialFields(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'getAllCredentialFields'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('getCredentialFields', () => {
    it('should throw an error if the "strategy" argument is not provided', () => {
      should(function () {
        kuzzle.security.getCredentialFields(undefined, options);
      }).throw('Kuzzle.security.getCredentialFields: strategy is required');
    });

    it('should call security/getCredentialFields query and return a Promise which resolves the list of credendial fields', () => {
      const result = ['username', 'password'];
      kuzzle.query.resolves(result);

      return kuzzle.security.getCredentialFields('strategy', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'getCredentialFields',
              strategy: 'strategy'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('getCredentials', () => {
    it('should throw an error if the "strategy" argument is not provided', () => {
      should(function () {
        kuzzle.security.getCredentials(undefined, 'kuid', options);
      }).throw('Kuzzle.security.getCredentials: strategy is required');
    });

    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.getCredentials('strategy', undefined, options);
      }).throw('Kuzzle.security.getCredentials: _id is required');
    });

    it('should call security/getCredentials query and return a Promise which resolves the user credentials', () => {
      const result = {
        username: 'foo',
        kuid: 'kuid'
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.getCredentials('strategy', 'kuid', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'getCredentials',
              strategy: 'strategy',
              _id: 'kuid'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('getCredentialsById', () => {
    it('should throw an error if the "strategy" argument is not provided', () => {
      should(function () {
        kuzzle.security.getCredentialsById(undefined, 'kuid', options);
      }).throw('Kuzzle.security.getCredentialsById: strategy is required');
    });

    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.getCredentialsById('strategy', undefined, options);
      }).throw('Kuzzle.security.getCredentialsById: _id is required');
    });

    it('should call security/getCredentialsById query and return a Promise which resolves the user credentials', () => {
      const result = {
        username: 'foo',
        kuid: 'kuid'
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.getCredentialsById('strategy', 'userId', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'getCredentialsById',
              strategy: 'strategy',
              _id: 'userId'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('getProfile', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.getProfile(undefined, options);
      }).throw('Kuzzle.security.getProfile: _id is required');
    });

    it('should call security/getProfile query with the profile id a Promise which resolves a Profile object', () => {
      kuzzle.query.resolves({
        _id: 'profileId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 1,
        _source: {
          policies: ['foo', 'bar']
        }
      });

      return kuzzle.security.getProfile('profileId', options)
        .then(profile => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              controller: 'security',
              action: 'getProfile'
            }, options);

          should(profile).be.an.instanceOf(Profile);
          should(profile._id).be.eql('profileId');
          should(profile.policies).be.eql(['foo', 'bar']);
        });
    });
  });

  describe('getProfileMapping', () => {
    it('should call security/getProfileMapping query and return a Promise which resolves a json object', () => {
      const result = {
        mapping: {foo: 'bar'}
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.getProfileMapping(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'getProfileMapping'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('getProfileRights', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.getProfileRights(undefined, options);
      }).throw('Kuzzle.security.getProfileRights: _id is required');
    });

    it('should call security/getProfileRights query with the profile id return a Promise which resolves the list of rights', () => {
      const result = {
        hits: [
          {controller: '*', action: '*', index: '*', collection: '*', value: 'allowed'},
          {controller: 'foo', action: 'bar', index: 'index', collection: 'collecton', value: 'allowed'}
        ]
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.getProfileRights('profileId', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              controller: 'security',
              action: 'getProfileRights'
            }, options);

          should(res).be.eql(result.hits);
        });
    });
  });

  describe('getRole', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.getRole(undefined, options);
      }).throw('Kuzzle.security.getRole: _id is required');
    });

    it('should call security/getRole query with the role id a Promise which resolves a Role object', () => {
      kuzzle.query.resolves({
        _id: 'roleId',
        _index: '%kuzzle',
        _type: 'roles',
        _version: 1,
        _source: {
          controllers: {foo: {actions: {bar: true}}}
        }
      });

      return kuzzle.security.getRole('roleId', options)
        .then(role => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'roleId',
              controller: 'security',
              action: 'getRole'
            }, options);

          should(role).be.an.instanceOf(Role);
          should(role._id).be.eql('roleId');
          should(role.controllers).be.eql({foo: {actions: {bar: true}}});
        });
    });
  });

  describe('getRoleMapping', () => {
    it('should call security/getRoleMapping query and return a Promise which resolves a json object', () => {
      const result = {
        mapping: {foo: 'bar'}
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.getRoleMapping(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'getRoleMapping'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('getUser', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.getUser(undefined, options);
      }).throw('Kuzzle.security.getUser: _id is required');
    });

    it('should call security/getUser query with the user id a Promise which resolves a User object', () => {
      kuzzle.query.resolves({
        _id: 'kuid',
        _index: '%kuzzle',
        _source: {
          profileIds: ['profileId'],
          name: 'John Doe',
        },
        _type: 'users',
        _version: 1
      });

      return kuzzle.security.getUser('kuid', options)
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              controller: 'security',
              action: 'getUser'
            }, options);

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('kuid');
          should(user.content).be.eql({name: 'John Doe', profileIds: ['profileId']});
          should(user.profileIds).be.eql(['profileId']);
        });
    });
  });

  describe('getUserMapping', () => {
    it('should call security/getUserMapping query and return a Promise which resolves a json object', () => {
      const result = {
        mapping: {foo: 'bar'}
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.getUserMapping(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'getUserMapping'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('getUserRights', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.getUserRights(undefined, options);
      }).throw('Kuzzle.security.getUserRights: _id is required');
    });

    it('should call security/getUserRights query with the user id return a Promise which resolves the list of rights', () => {
      const result = {
        hits: [
          {controller: '*', action: '*', index: '*', collection: '*', value: 'allowed'},
          {controller: 'foo', action: 'bar', index: 'index', collection: 'collecton', value: 'allowed'}
        ]
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.getUserRights('kuid', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              controller: 'security',
              action: 'getUserRights'
            }, options);

          should(res).be.eql(result.hits);
        });
    });
  });

  describe('hasCredentials', () => {
    it('should throw an error if the "strategy" argument is not provided', () => {
      should(function () {
        kuzzle.security.hasCredentials(undefined, 'kuid', options);
      }).throw('Kuzzle.security.hasCredentials: strategy is required');
    });

    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.hasCredentials('strategy', undefined, options);
      }).throw('Kuzzle.security.hasCredentials: _id is required');
    });

    it('should call security/hasCredentials query and return a Promise which resolves a boolean', () => {
      kuzzle.query.resolves(true);

      return kuzzle.security.hasCredentials('strategy', 'kuid', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'hasCredentials',
              strategy: 'strategy',
              _id: 'kuid'
            }, options);

          should(res).be.a.Boolean().and.be.True();
        });
    });
  });

  describe('mDeleteProfiles', () => {
    it('should throw an error if the "ids" argument is not provided', () => {
      should(function () {
        kuzzle.security.mDeleteProfiles(undefined, options);
      }).throw('Kuzzle.security.mDeleteProfiles: ids must be an array');
    });

    it('should throw an error if the "ids" argument is not an array', () => {
      should(function () {
        kuzzle.security.mDeleteProfiles('profile1', options);
      }).throw('Kuzzle.security.mDeleteProfiles: ids must be an array');
    });

    it('should call security/mDeleteProfiles query and return a Promise which resolves the list of deleted profiles ids', () => {
      const result = ['profile1', 'profile2'];
      kuzzle.query.resolves(result);

      return kuzzle.security.mDeleteProfiles(['profile1', 'profile2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'mDeleteProfiles',
              body: {ids: ['profile1', 'profile2']},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = ['profile1', 'profile2'];
      kuzzle.query.resolves(result);

      return kuzzle.security.mDeleteProfiles(['profile1', 'profile2'], {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'mDeleteProfiles',
              body: {ids: ['profile1', 'profile2']},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('mDeleteRoles', () => {
    it('should throw an error if the "ids" argument is not provided', () => {
      should(function () {
        kuzzle.security.mDeleteRoles(undefined, options);
      }).throw('Kuzzle.security.mDeleteRoles: ids must be an array');
    });

    it('should throw an error if the "ids" argument is not an array', () => {
      should(function () {
        kuzzle.security.mDeleteRoles('role1', options);
      }).throw('Kuzzle.security.mDeleteRoles: ids must be an array');
    });

    it('should call security/mDeleteRoles query and return a Promise which resolves the list of deleted roles ids', () => {
      const result = ['role1', 'role2'];
      kuzzle.query.resolves(result);

      return kuzzle.security.mDeleteRoles(['role1', 'role2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'mDeleteRoles',
              body: {ids: ['role1', 'role2']},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = ['role1', 'role2'];
      kuzzle.query.resolves(result);

      return kuzzle.security.mDeleteRoles(['role1', 'role2'], {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'mDeleteRoles',
              body: {ids: ['role1', 'role2']},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('mDeleteUsers', () => {
    it('should throw an error if the "ids" argument is not provided', () => {
      should(function () {
        kuzzle.security.mDeleteUsers(undefined, options);
      }).throw('Kuzzle.security.mDeleteUsers: ids must be an array');
    });

    it('should throw an error if the "ids" argument is not an array', () => {
      should(function () {
        kuzzle.security.mDeleteUsers('user1', options);
      }).throw('Kuzzle.security.mDeleteUsers: ids must be an array');
    });

    it('should call security/mDeleteUsers query and return a Promise which resolves the list of deleted users ids', () => {
      const result = ['user1', 'user2'];
      kuzzle.query.resolves(result);

      return kuzzle.security.mDeleteUsers(['user1', 'user2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'mDeleteUsers',
              body: {ids: ['user1', 'user2']},
              refresh: undefined
            }, options);

          should(res).be.equal(result);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      const result = ['user1', 'user2'];
      kuzzle.query.resolves(result);

      return kuzzle.security.mDeleteUsers(['user1', 'user2'], {refresh: true})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'mDeleteUsers',
              body: {ids: ['user1', 'user2']},
              refresh: true
            }, {});

          should(res).be.equal(result);
        });
    });
  });

  describe('mGetProfiles', () => {
    it('should throw an error if the "ids" argument is not provided', () => {
      should(function () {
        kuzzle.security.mGetProfiles(undefined, options);
      }).throw('Kuzzle.security.mGetProfiles: ids must be an array');
    });

    it('should throw an error if the "ids" argument is not an array', () => {
      should(function () {
        kuzzle.security.mGetProfiles('profile1', options);
      }).throw('Kuzzle.security.mGetProfiles: ids must be an array');
    });

    it('should call security/mGetProfiles query and return a Promise which resolves the list of profiles', () => {
      const result = {
        hits: [
          {_id: 'profile1', _version: 1, _source: {policies: ['foo', 'bar']}},
          {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz']}}
        ],
        total: 2
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.mGetProfiles(['profile1', 'profile2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'mGetProfiles',
              body: {ids: ['profile1', 'profile2']}
            }, options);

          should(res).be.an.Array();
          should(res.length).be.equal(2);

          should(res[0]).be.an.instanceOf(Profile);
          should(res[0]._id).be.eql('profile1');
          should(res[0].policies).be.eql(['foo', 'bar']);

          should(res[1]).be.an.instanceOf(Profile);
          should(res[1]._id).be.eql('profile2');
          should(res[1].policies).be.eql(['foo', 'baz']);
        });
    });
  });

  describe('mGetRoles', () => {
    it('should throw an error if the "ids" argument is not provided', () => {
      should(function () {
        kuzzle.security.mGetRoles(undefined, options);
      }).throw('Kuzzle.security.mGetRoles: ids must be an array');
    });

    it('should throw an error if the "ids" argument is not an array', () => {
      should(function () {
        kuzzle.security.mGetRoles('role1', options);
      }).throw('Kuzzle.security.mGetRoles: ids must be an array');
    });

    it('should call security/mGetRoles query and return a Promise which resolves the list of roles', () => {
      const result = {
        hits: [
          {_id: 'role1', _version: 1, _source: {controllers: {foo: {actions: {bar: true}}}}},
          {_id: 'role2', _version: 3, _source: {controllers: {bar: {actions: {foo: true}}}}}
        ],
        total: 2
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.mGetRoles(['role1', 'role2'], options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'mGetRoles',
              body: {ids: ['role1', 'role2']}
            }, options);

          should(res).be.an.Array();
          should(res.length).be.equal(2);

          should(res[0]).be.an.instanceOf(Role);
          should(res[0]._id).be.eql('role1');
          should(res[0].controllers).be.eql({foo: {actions: {bar: true}}});

          should(res[1]).be.an.instanceOf(Role);
          should(res[1]._id).be.eql('role2');
          should(res[1].controllers).be.eql({bar: {actions: {foo: true}}});
        });
    });
  });

  describe('replaceUser', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.replaceUser(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.replaceUser: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.replaceUser('userId', undefined, options);
      }).throw('Kuzzle.security.replaceUser: body is required');
    });

    it('should call security/replaceUser query with the user content and return a Promise which resolves a User object', () => {
      kuzzle.query.resolves({
        _id: 'kuid',
        _index: '%kuzzle',
        _source: {
          profileIds: ['profileId'],
          name: 'John Doe',
        },
        _type: 'users',
        _version: 2,
        created: false
      });

      return kuzzle.security.replaceUser('userId', {foo: 'bar'}, options)
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'userId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'replaceUser',
              refresh: undefined
            }, options);

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('kuid');
          should(user.content).be.eql({name: 'John Doe', profileIds: ['profileId']});
          should(user.profileIds).be.eql(['profileId']);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'kuid',
        _index: '%kuzzle',
        _source: {
          profileIds: ['profileId'],
          name: 'John Doe',
        },
        _type: 'users',
        _version: 1,
        created: true
      });

      return kuzzle.security.replaceUser('userId', {foo: 'bar'}, {refresh: true})
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'userId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'replaceUser',
              refresh: true
            }, {});

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('kuid');
          should(user.content).be.eql({name: 'John Doe', profileIds: ['profileId']});
          should(user.profileIds).be.eql(['profileId']);
        });
    });
  });

  describe('searchProfiles', () => {
    it('should call security/searchProfiles query and return a Promise which resolves a ProfileSearchResult instance', () => {
      const result = {
        hits: [
          {_id: 'profile1', _version: 1, _source: {policies: ['foo', 'bar']}},
          {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz']}},
          {_id: 'profile3', _version: 3, _source: {policies: ['bar', 'baz']}}
        ],
        total: 3
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.searchProfiles({roles: ['foo', 'bar']}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'searchProfiles',
              body: {roles: ['foo', 'bar']},
              from: undefined,
              size: undefined,
              scroll: undefined
            }, options);

          should(res).be.an.instanceOf(ProfileSearchResult);
          should(res.options).be.equal(options);
          should(res.response).be.equal(result);
          should(res.fetched).be.equal(3);
          should(res.total).be.equal(3);
        });
    });

    it('should inject the "from", "size", "scroll" options into the request', () => {
      const result = {
        hits: [
          {_id: 'profile2', _version: 3, _source: {policies: ['foo', 'baz']}},
          {_id: 'profile3', _version: 3, _source: {policies: ['bar', 'baz']}}
        ],
        total: 3
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.searchProfiles({roles: ['foo', 'bar']}, {from: 1, size: 2, scroll: '1m'})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'searchProfiles',
              body: {roles: ['foo', 'bar']},
              from: 1,
              size: 2,
              scroll: '1m'
            }, {});

          should(res).be.an.instanceOf(ProfileSearchResult);
          should(res.options).be.empty();
          should(res.response).be.equal(result);
          should(res.fetched).be.equal(2);
          should(res.total).be.equal(3);
        });
    });
  });

  describe('searchRoles', () => {
    it('should call security/searchRoles query and return a Promise which resolves a RoleSearchResult instance', () => {
      const result = {
        hits: [
          {_id: 'role1', _version: 1, _source: {controllers: {foo: {actions: {bar: true}}}}},
          {_id: 'role2', _version: 3, _source: {controllers: {bar: {actions: {foo: true}}}}},
          {_id: 'role3', _version: 3, _source: {controllers: {foo: {actions: {baz: true}}}}}
        ],
        total: 3
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.searchRoles({controllers: ['foo', 'bar']}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'searchRoles',
              body: {controllers: ['foo', 'bar']},
              from: undefined,
              size: undefined
            }, options);

          should(res).be.an.instanceOf(RoleSearchResult);
          should(res.options).be.equal(options);
          should(res.response).be.equal(result);
          should(res.fetched).be.equal(3);
          should(res.total).be.equal(3);
        });
    });

    it('should inject the "from" and "size" options into the request', () => {
      const result = {
        hits: [
          {_id: 'role2', _version: 3, _source: {controllers: {bar: {actions: {foo: true}}}}},
          {_id: 'role3', _version: 3, _source: {controllers: {foo: {actions: {baz: true}}}}}
        ],
        total: 3
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.searchRoles({controllers: ['foo', 'bar']}, {from: 1, size: 2})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'searchRoles',
              body: {controllers: ['foo', 'bar']},
              from: 1,
              size: 2
            }, {});

          should(res).be.an.instanceOf(RoleSearchResult);
          should(res.options).be.empty();
          should(res.response).be.equal(result);
          should(res.fetched).be.equal(2);
          should(res.total).be.equal(3);
        });
    });
  });

  describe('searchUsers', () => {
    it('should call security/searchUsers query and return a Promise which resolves a UserSearchResult instance', () => {
      const result = {
        hits: [
          {_id: 'uid1', _version: 1, _source: {profileIds: ['profile1'], name: 'John Doe'}},
          {_id: 'uid2', _version: 3, _source: {profileIds: ['admin'], name: 'Jane Doe'}},
          {_id: 'uid3', _version: 2, _source: {profileIds: ['profile1', 'admin'], name: 'Sarah Connor'}}
        ],
        total: 3
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.searchUsers({foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'searchUsers',
              body: {foo: 'bar'},
              from: undefined,
              size: undefined,
              scroll: undefined
            }, options);

          should(res).be.an.instanceOf(UserSearchResult);
          should(res.options).be.equal(options);
          should(res.response).be.equal(result);
          should(res.fetched).be.equal(3);
          should(res.total).be.equal(3);
        });
    });

    it('should inject the "from", "size", "scroll" options into the request', () => {
      const result = {
        hits: [
          {_id: 'uid2', _version: 3, _source: {profileIds: ['admin'], name: 'Jane Doe'}},
          {_id: 'uid3', _version: 2, _source: {profileIds: ['profile1', 'admin'], name: 'Sarah Connor'}}
        ],
        total: 3
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.searchUsers({foo: 'bar'}, {from: 1, size: 2, scroll: '1m'})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'security',
              action: 'searchUsers',
              body: {foo: 'bar'},
              from: 1,
              size: 2,
              scroll: '1m'
            }, {});

          should(res).be.an.instanceOf(UserSearchResult);
          should(res.options).be.empty();
          should(res.response).be.equal(result);
          should(res.fetched).be.equal(2);
          should(res.total).be.equal(3);
        });
    });
  });

  describe('updateCredentials', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateCredentials('strategy', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.updateCredentials: _id is required');
    });

    it('should throw an error if the "strategy" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateCredentials(undefined, 'kuid', {foo: 'bar'}, options);
      }).throw('Kuzzle.security.updateCredentials: strategy is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateCredentials('strategy', 'kuid', undefined, options);
      }).throw('Kuzzle.security.updateCredentials: body is required');
    });

    it('should call security/updateCredentials query with the user credentials and return a Promise which resolves a json object', () => {
      const result = {
        username: 'foo',
        kuid: 'kuid'
      };
      kuzzle.query.resolves(result);

      return kuzzle.security.updateCredentials('strategy', 'kuid', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              strategy: 'strategy',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateCredentials'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('updateProfile', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateProfile(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.updateProfile: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateProfile('profileId', undefined, options);
      }).throw('Kuzzle.security.updateProfile: body is required');
    });

    it('should call security/updateProfile query with the profile content and return a Promise which resolves a Profile object', () => {
      kuzzle.query.resolves({
        _id: 'profileId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 2,
        _source: {
          policies: ['foo', 'bar']
        },
        created: false
      });

      return kuzzle.security.updateProfile('profileId', {foo: 'bar'}, options)
        .then(profile => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateProfile',
              refresh: undefined
            }, options);

          should(profile).be.an.instanceOf(Profile);
          should(profile._id).be.eql('profileId');
          should(profile.policies).be.eql(['foo', 'bar']);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'profileId',
        _index: '%kuzzle',
        _type: 'profiles',
        _version: 2,
        _source: {
          policies: ['foo', 'bar']
        },
        created: false
      });

      return kuzzle.security.updateProfile('profileId', {foo: 'bar'}, {refresh: true})
        .then(profile => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'profileId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateProfile',
              refresh: true
            }, {});

          should(profile).be.an.instanceOf(Profile);
          should(profile._id).be.eql('profileId');
          should(profile.policies).be.eql(['foo', 'bar']);
        });
    });
  });

  describe('updateProfileMapping', () => {
    it('should call security/updateProfileMapping query with the new mapping and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({acknowledged: true});

      return kuzzle.security.updateProfileMapping({foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateProfileMapping'
            }, options);

          should(res.acknowledged).be.a.Boolean().and.be.True();
        });
    });
  });

  describe('updateRole', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateRole(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.updateRole: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateRole('roleId', undefined, options);
      }).throw('Kuzzle.security.updateRole: body is required');
    });

    it('should call security/updateRole query with the role content and return a Promise which resolves a Role object', () => {
      kuzzle.query.resolves({
        _id: 'roleId',
        _index: '%kuzzle',
        _type: 'roles',
        _version: 2,
        _source: {
          controllers: {foo: {actions: {bar: true}}}
        },
        created: false
      });

      return kuzzle.security.updateRole('roleId', {foo: 'bar'}, options)
        .then(role => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'roleId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateRole',
              refresh: undefined
            }, options);

          should(role).be.an.instanceOf(Role);
          should(role._id).be.eql('roleId');
          should(role.controllers).be.eql({foo: {actions: {bar: true}}});
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'roleId',
        _index: '%kuzzle',
        _type: 'roles',
        _version: 2,
        _source: {
          controllers: {foo: {actions: {bar: true}}}
        },
        created: false
      });

      return kuzzle.security.updateRole('roleId', {foo: 'bar'}, {refresh: true})
        .then(role => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'roleId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateRole',
              refresh: true
            }, {});

          should(role).be.an.instanceOf(Role);
          should(role._id).be.eql('roleId');
          should(role.controllers).be.eql({foo: {actions: {bar: true}}});
        });
    });
  });

  describe('updateRoleMapping', () => {
    it('should call security/updateRoleMapping query with the new mapping and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({acknowledged: true});

      return kuzzle.security.updateRoleMapping({foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateRoleMapping'
            }, options);

          should(res.acknowledged).be.a.Boolean().and.be.True();
        });
    });
  });

  describe('updateUser', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateUser(undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.updateUser: _id is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.updateUser('userId', undefined, options);
      }).throw('Kuzzle.security.updateUser: body is required');
    });

    it('should call security/updateUser query with the user content to update and return a Promise which resolves a User object', () => {
      kuzzle.query.resolves({
        _id: 'kuid',
        _index: '%kuzzle',
        _source: {
          profileIds: ['profileId'],
          name: 'John Doe',
        },
        _type: 'users',
        _version: 2,
        created: false
      });

      return kuzzle.security.updateUser('userId', {foo: 'bar'}, options)
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'userId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateUser',
              refresh: undefined
            }, options);

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('kuid');
          should(user.content).be.eql({name: 'John Doe', profileIds: ['profileId']});
          should(user.profileIds).be.eql(['profileId']);
        });
    });

    it('should inject the "refresh" option into the request', () => {
      kuzzle.query.resolves({
        _id: 'kuid',
        _index: '%kuzzle',
        _source: {
          profileIds: ['profileId'],
          name: 'John Doe',
        },
        _type: 'users',
        _version: 2,
        created: false
      });

      return kuzzle.security.updateUser('userId', {foo: 'bar'}, {refresh: true})
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'userId',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateUser',
              refresh: true
            }, {});

          should(user).be.an.instanceOf(User);
          should(user._id).be.eql('kuid');
          should(user.content).be.eql({name: 'John Doe', profileIds: ['profileId']});
          should(user.profileIds).be.eql(['profileId']);
        });
    });
  });

  describe('updateUserMapping', () => {
    it('should call security/updateUserMapping query with the new mapping and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({acknowledged: true});

      return kuzzle.security.updateUserMapping({foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: {foo: 'bar'},
              controller: 'security',
              action: 'updateUserMapping'
            }, options);

          should(res.acknowledged).be.a.Boolean().and.be.True();
        });
    });
  });

  describe('validateCredentials', () => {
    it('should throw an error if the "_id" argument is not provided', () => {
      should(function () {
        kuzzle.security.validateCredentials('strategy', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.security.validateCredentials: _id is required');
    });

    it('should throw an error if the "strategy" argument is not provided', () => {
      should(function () {
        kuzzle.security.validateCredentials(undefined, 'kuid', {foo: 'bar'}, options);
      }).throw('Kuzzle.security.validateCredentials: strategy is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.security.validateCredentials('strategy', 'kuid', undefined, options);
      }).throw('Kuzzle.security.validateCredentials: body is required');
    });

    it('should call security/validateCredentials query with the user credentials and return a Promise which resolves a boolean', () => {
      kuzzle.query.resolves(true);

      return kuzzle.security.validateCredentials('strategy', 'kuid', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              _id: 'kuid',
              strategy: 'strategy',
              body: {foo: 'bar'},
              controller: 'security',
              action: 'validateCredentials'
            }, options);

          should(res).be.a.Boolean().and.be.True();
        });
    });
  });
});
