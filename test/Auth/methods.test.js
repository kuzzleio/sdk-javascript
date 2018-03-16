const
  should = require('should'),
  KuzzleMock = require('../mocks/kuzzle.mock'),
  Auth = require('../../src/Auth.js'),
  User = require('../../src/security/User.js'),
  Security = require('../../src/security/Security.js');

describe('Kuzzle Auth controller', function () {
  let
    auth,
    kuzzle;

  beforeEach(() => {
    kuzzle = new KuzzleMock();
    auth = new Auth(kuzzle);
  });

  describe('#checkToken', function () {
    const token = 'fakeToken',
      expectedQuery = {
        controller: 'auth',
        action: 'checkToken'
      },
      result = {
        result: {
          valid: true,
          state: 'Error message',
          expiresAt: 42424242
        }
      };

    it('should call query with the right arguments and return Promise which resolves', () => {
      kuzzle.query.resolves(result);

      return auth.checkToken(token)
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {body: {token: token}}, {queuable: false});
          should(res).be.exactly(result.result);
        });
    });
  });

  describe('#createMyCredentials', function () {
    const credentials = {foo: 'bar'},
      expectedQuery = {
        controller: 'auth',
        action: 'createMyCredentials'
      },
      result = {
        result: {
          foo: 'bar'
        }
      };

    it('should call query with the right arguments and return Promise which resolves an object', () => {
      kuzzle.query.resolves(result);

      return auth.createMyCredentials('strategy', credentials)
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {body: {foo: 'bar'}, strategy: 'strategy'}, undefined);
          should(res).be.exactly(result.result);
        });
    });
  });

  describe('#credentialsExist', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'credentialsExist'
      },
      result = {
        result: {
          acknowledged: true
        }
      };

    it('should call query with the right arguments and return Promise which resolves an object', () => {
      kuzzle.query.resolves(result);

      return auth.credentialsExist('strategy')
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {strategy: 'strategy'}, undefined);
          should(res).be.exactly(result.result);
        });
    });
  });

  describe('#deleteMyCredentials', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'deleteMyCredentials'
      },
      result = {
        result: {
          acknowledged: true
        }
      };

    it('should call query with the right arguments and return Promise which resolves an object', () => {
      kuzzle.query.resolves(result);

      return auth.deleteMyCredentials('strategy')
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {strategy: 'strategy'}, undefined);
          should(res).be.exactly(result.result);
        });
    });
  });

  describe('#getCurrentUser', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'getCurrentUser'
      },
      result = {
        result: {
          _id: 'foobar',
          _source: {
            name: {
              first: 'John',
              last: 'Doe'
            },
            profile: {
              _id: 'default',
              roles: [
                {_id: 'default'}
              ]
            }
          }
        }
      };

    it('should call query with the right arguments and return Promise which resolves a user', () => {
      kuzzle.query.resolves(result);
      const userResponse = new User(new Security(kuzzle), result.result._id, result.result._source, result.result._meta);

      return auth.getCurrentUser()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res.id).be.exactly(userResponse.id);
          should(res.content).be.exactly(userResponse.content);
        });
    });
  });

  describe('#getCurrentUser', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'getCurrentUser'
      },
      result = {
        result: {
          _id: 'foobar',
          _source: {
            name: {
              first: 'John',
              last: 'Doe'
            },
            profile: {
              _id: 'default',
              roles: [
                {_id: 'default'}
              ]
            }
          }
        }
      };

    it('should call query with the right arguments and return Promise which resolves a user', () => {
      kuzzle.query.resolves(result);
      const userResponse = new User(new Security(kuzzle), result.result._id, result.result._source, result.result._meta);

      return auth.getCurrentUser()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res.id).be.exactly(userResponse.id);
          should(res.content).be.exactly(userResponse.content);
        });
    });
  });

  describe('#getMyCredentials', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'getMyCredentials'
      },
      result = {
        result: {
          username: 'foo',
          kuid: '42'
        }
      };

    it('should call query with the right arguments and return Promise which resolves an object', () => {
      kuzzle.query.resolves(result);

      return auth.getMyCredentials('strategy')
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {strategy: 'strategy'}, undefined);
          should(res).be.exactly(result.result);
        });
    });
  });

  describe('#getMyRights', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'getMyRights'
      },
      result = {
        result: {
          hits: [
            {
              'controller': 'ctrl_name',
              'action': 'action_name',
              'index': 'index_name',
              'collection': 'collection_name',
              'value': 'allowed|denied|conditional'
            }
          ]
        }
      };

    it('should call query with the right arguments and return Promise which resolves an array', () => {
      kuzzle.query.resolves(result);

      return auth.getMyRights()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res).be.an.Array().and.eql(result.result.hits);
        });
    });
  });

  describe('#getStrategies', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'getStrategies'
      },
      result = {
        result: [
          'local',
          'facebook'
        ]
      };

    it('should call query with the right arguments and return Promise which resolves an array', () => {
      kuzzle.query.resolves(result);

      return auth.getStrategies()
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, undefined);
          should(res).be.an.Array().and.eql(result.result);
        });
    });
  });

  describe('#login', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'login'
      },
      result = {
        result: {
          jwt: 'jwt'
        }
      };

    it('should reject if no strategy is given', () => {
      return auth.login().should.be.rejected();
    });

    it('should reject if query rejects', () => {
      kuzzle.query.rejects(new Error('error'));

      return auth.login('strategy')
        .catch(() => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.emit).be.calledWith('loginAttempt', {success: false, error: 'error'});
        });
    });

    it('should call query with right arguments and return Promise which resolves a jwt', () => {
      kuzzle.query.resolves(result);

      return auth.login('strategy')
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {body: {}, strategy: 'strategy'}, {queuable: false});
          should(res).be.eql(result.result.jwt);
        });
    });

    it('should call query with right arguments and credentials and return Promise which resolves a jwt', () => {
      kuzzle.query.resolves(result);

      return auth.login('strategy', {username: 'foo'})
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {
            body: {username: 'foo'},
            strategy: 'strategy'
          }, {queuable: false});
          should(res).be.eql(result.result.jwt);
        });
    });

    it('should call query with right arguments and expiresIn as int and return Promise which resolves a jwt', () => {
      kuzzle.query.resolves(result);

      return auth.login('strategy', null, 42)
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {
            body: {},
            expiresIn: 42,
            strategy: 'strategy'
          }, {queuable: false});
          should(res).be.eql(result.result.jwt);
        });
    });

    it('should call query with right arguments and expiresIn as string and return Promise which resolves a jwt', () => {
      kuzzle.query.resolves(result);

      return auth.login('strategy', null, '4h')
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {
            body: {},
            expiresIn: '4h',
            strategy: 'strategy'
          }, {queuable: false});
          should(res).be.eql(result.result.jwt);
        });
    });

    it('should call query with right arguments and credentials and expiresIn as int and return Promise which resolves a jwt', () => {
      kuzzle.query.resolves(result);

      return auth.login('strategy', {username: 'foo'}, 42)
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {
            body: {username: 'foo'},
            expiresIn: 42,
            strategy: 'strategy'
          }, {queuable: false});
          should(res).be.eql(result.result.jwt);
        });
    });

    it('should call query with right arguments and credentials and expiresIn as int and return Promise which resolves a jwt', () => {
      kuzzle.query.resolves(result);

      return auth.login('strategy', {username: 'foo'}, '4h')
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {
            body: {username: 'foo'},
            expiresIn: '4h',
            strategy: 'strategy'
          }, {queuable: false});
          should(res).be.eql(result.result.jwt);
        });
    });
  });

  describe('#logout', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'logout'
      },
      result = {};

    it('should call query with the right arguments and return Promise which resolves an array', () => {
      kuzzle.query.resolves(result);

      return auth.logout()
        .then(() => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {}, {queuable: false});
          should(kuzzle.unsetJwt).be.calledOnce();
        });
    });
  });

  describe('#updateMyCredentials', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'updateMyCredentials'
      },
      result = {
        result: {
          username: 'foo',
          kuid: '42'
        }
      };

    it('should call query with the right arguments and return Promise which resolves an object', () => {
      kuzzle.query.resolves(result);

      return auth.updateMyCredentials('strategy', {username: 'foo'})
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {strategy: 'strategy', body: {username: 'foo'}}, undefined);
          should(res).be.eql(result.result);
        });
    });
  });

  describe('#updateSelf', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'updateSelf'
      },
      result = {
        result: {
          username: 'foo',
          kuid: '42'
        }
      };

    it('should call query with the right arguments and return Promise which resolves a user', () => {
      kuzzle.query.resolves(result);

      return auth.updateSelf({username: 'foo'})
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {body: {username: 'foo'}}, undefined);
          should(res).be.eql(result.result);
        });
    });
  });

  describe('#validateMyCredentials', function () {
    const expectedQuery = {
        controller: 'auth',
        action: 'validateMyCredentials'
      },
      result = {
        result: true
      };

    it('should call query with the right arguments and return Promise which resolves a boolean', () => {
      kuzzle.query.resolves(result);

      return auth.validateMyCredentials('strategy', {username: 'foo'})
        .then(res => {
          should(kuzzle.query).be.calledOnce();
          should(kuzzle.query).be.calledWith(expectedQuery, {strategy: 'strategy', body: {username: 'foo'}}, undefined);
          should(res).be.eql(result.result);
        });
    });
  });

});