const
  AuthController = require('../../src/controllers/auth'),
  User = require('../../src/controllers/security/user'),
  sinon = require('sinon'),
  should = require('should');

describe('Auth Controller', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      emit: sinon.stub(),
      query: sinon.stub()
    };
    kuzzle.auth = new AuthController(kuzzle);
  });

  describe('checkToken', () => {
    it('should call auth/checkToken query with the token and return a Promise which resolves the token validity', () => {
      kuzzle.query.resolves({
        result: {
          valid: true,
          state: 'Error message',
          expiresAt: 42424242
        }
      });

      return kuzzle.auth.checkToken('token', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'checkToken',
              body: {
                token: 'token'
              }
            }, {queuable: false});
          should(res).match({
            valid: true,
            state: 'Error message',
            expiresAt: 42424242
          });
        });
    });
  });

  describe('createMyCredentials', () => {
    it('should call auth/createMyCredentials query with the user credentials and return a Promise which resolves a json object', () => {
      const credentials = {foo: 'bar'};

      kuzzle.query.resolves({
        result: {
          username: 'foo',
          kuid: 'bar'
        }
      });

      return kuzzle.auth.createMyCredentials('strategy', credentials, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              strategy: 'strategy',
              body: credentials,
              controller: 'auth',
              action: 'createMyCredentials'
            }, options);

          should(res).match({username: 'foo', kuid: 'bar'});
        });
    });
  });

  describe('credentialsExist', () => {
    it('should call auth/credentialExists query with the strategy name and return a Promise which resolves a boolean', () => {
      kuzzle.query.resolves({result: true});

      return kuzzle.auth.credentialsExist('strategy', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              strategy: 'strategy',
              controller: 'auth',
              action: 'credentialsExist'
            }, options);

          should(res).be.exactly(true);
        });
    });
  });

  describe('deleteMyCredentials', () => {
    it('should call auth/deleteMyCredentials query with the strategy name and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({result: {acknowledged: true}});

      return kuzzle.auth.deleteMyCredentials('strategy', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              strategy: 'strategy',
              controller: 'auth',
              action: 'deleteMyCredentials'
            }, options);

          should(res).be.exactly(true);
        });
    });
  });

  describe('getCurrentUser', () => {
    it('should call auth/getCurrentUser query and return a Promise which resolves a User object', () => {
      kuzzle.query.resolves({
        result: {
          _id: 'id',
          _source: {name: 'Doe'}
        }
      });

      return kuzzle.auth.getCurrentUser(options)
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'getCurrentUser'
            }, options);

          should(user).be.an.instanceOf(User);
          should(user._id).eql('id');
          should(user.content).eql({name: 'Doe'});
        });
    });
  });

  describe('getMyCredentials', () => {
    it('should call auth/getMyCredentials query with the strategy name and return a Promise which resolves the user credentials', () => {
      kuzzle.query.resolves({
        result: {
          username: 'foo',
          kuid: 'bar'
        }
      });

      return kuzzle.auth.getMyCredentials('strategy', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              strategy: 'strategy',
              controller: 'auth',
              action: 'getMyCredentials'
            }, options);

          should(res).match({username: 'foo', kuid: 'bar'});
        });
    });
  });

  describe('getMyRights', () => {
    it('should call auth/getMyCredentials query with the strategy name and return a Promise which resolves the user permissions as an array', () => {
      kuzzle.query.resolves({result: {hits: [
        {controller: 'foo', action: 'bar', index: 'foobar', collection: '*', value: 'allowed'}
      ]}});

      return kuzzle.auth.getMyRights(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'getMyRights'
            }, options);

          should(res).be.an.Array();
          should(res[0]).match({controller: 'foo', action: 'bar', index: 'foobar', collection: '*', value: 'allowed'});
        });
    });
  });

  describe('getStrategies', () => {
    it('should call auth/getStrategies query and return a Promise which resolves the list of strategies as an array', () => {
      kuzzle.query.resolves({result: ['local', 'github', 'foo', 'bar']});

      return kuzzle.auth.getStrategies(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'getStrategies'
            }, options);

          should(res).be.an.Array();
          should(res[0]).be.equal('local');
          should(res[1]).be.equal('github');
          should(res[2]).be.equal('foo');
          should(res[3]).be.equal('bar');
        });
    });
  });

  describe('login', () => {
    const credentials = {foo: 'bar'};

    beforeEach(() => {
      kuzzle.query.resolves({
        result: {
          _id: 'kuid',
          jwt: 'jwt'
        }
      });
    });

    it('should throw an error if the "strategy" argument is not set', () => {
      should(function () {
        kuzzle.auth.login(undefined, {}, options);
      }).throw('Kuzzle.auth.login: strategy is required');
    });

    it('should throw an error if the "strategy" argument is empty', () => {
      should(function () {
        kuzzle.auth.login('', {}, options);
      }).throw('Kuzzle.auth.login: strategy is required');
    });

    it('should call auth/login query and return a Promise which resolves a JWT', () => {
      return kuzzle.auth.login('strategy', credentials, 'expiresIn')
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'login',
              strategy: 'strategy',
              expiresIn: 'expiresIn',
              body: credentials
            }, {queuable: false});

          should(res).be.equal('jwt');
        });
    });

    it('should trigger a "loginAttempt" event once the user is logged in', () => {
      return kuzzle.auth.login('strategy', credentials, 'expiresIn')
        .then(() => {
          should(kuzzle.emit)
            .be.calledOnce()
            .be.calledWith('loginAttempt');
        });
    });

    it('should set the received JWT as kuzzle property', () => {
      return kuzzle.auth.login('strategy', credentials, 'expiresIn')
        .then(() => {
          should(kuzzle.jwt).be.equal('jwt');
        });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      kuzzle.jwt = 'jwt';
      kuzzle.query.resolves({result: {aknowledged: true}});
    });

    it('should call auth/logout query and return an empty Promise', () => {
      return kuzzle.auth.logout()
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'logout'
            });

          should(res).be.undefined();
        });
    });

    it('should unset the kuzzle.jwt property', () => {
      return kuzzle.auth.logout()
        .then(() => {
          should(kuzzle.jwt).be.undefined();
        });
    });
  });

  describe('updateMyCredentials', () => {
    it('should call auth/updateMyCredentials query with the user credentials and return a Promise which resolves a json object', () => {
      const credentials = {foo: 'bar'};

      kuzzle.query.resolves({
        result: {
          username: 'foo',
          kuid: 'bar'
        }
      });

      return kuzzle.auth.updateMyCredentials('strategy', credentials, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'updateMyCredentials',
              strategy: 'strategy',
              body: credentials
            }, options);

          should(res).match({username: 'foo', kuid: 'bar'});
        });
    });
  });

  describe('updateSelf', () => {
    it('should call auth/updateSelf query with the user content and return a Promise which resolves a User object', () => {
      const body = {foo: 'bar'};

      kuzzle.query.resolves({
        result: {
          _id: 'kuid',
          _source: {foo: 'bar'}
        }
      });

      return kuzzle.auth.updateSelf(body, options)
        .then(user => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'updateSelf',
              body
            }, options);

          should(user).be.an.instanceOf(User);
          should(user._id).eql('kuid');
          should(user.content).eql({foo: 'bar'});
        });
    });
  });

  describe('validateMyCredentials', () => {
    it('should call auth/validateMyCredentials query with the strategy and its credentials and return a Promise which resolves a boolean', () => {
      const body = {foo: 'bar'};

      kuzzle.query.resolves({result: true});

      return kuzzle.auth.validateMyCredentials('strategy', body, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              strategy: 'strategy',
              body,
              controller: 'auth',
              action: 'validateMyCredentials'
            }, options);

          should(res).be.exactly(true);
        });
    });
  });

  describe('refreshToken', () => {
    const tokenResponse = { _id: 'foo', jwt: 'newToken' };

    beforeEach(() => {
      kuzzle.jwt = 'jwt';
      kuzzle.query.resolves({result: tokenResponse});
    });

    it('should call auth/refreshToken query', () => {
      return kuzzle.auth.refreshToken()
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'refreshToken',
              expiresIn: undefined
            });

          should(res).be.eql(tokenResponse);
          should(kuzzle.jwt).be.eql('newToken');
        });
    });

    it('should set the expiresIn option if one is provided', () => {
      return kuzzle.auth.refreshToken({expiresIn: 'foobar'})
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'auth',
              action: 'refreshToken',
              expiresIn: 'foobar'
            });

          should(res).be.eql(tokenResponse);
          should(kuzzle.jwt).be.eql('newToken');
        });
    });
  });
});
