const
  AuthController = require('../../src/controllers/auth'),
  sinon = require('sinon'),
  should = require('should');

describe('auth', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      emit: sinon.stub(),
      query: sinon.stub().resolves()
    };
    kuzzle.auth = new AuthController(kuzzle);
  });

  it('checkToken', () => {
    return kuzzle.auth.checkToken('token', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'auth',
            action: 'checkToken',
            body: {
              token: 'token'
            }
          }, {queuable: false});
      });
  });

  it('createMyCredentials', () => {
    const credentials = {foo: 'bar'};

    return kuzzle.auth.createMyCredentials('strategy', credentials, options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            strategy: 'strategy',
            body: credentials,
            controller: 'auth',
            action: 'createMyCredentials'
          }, options);
      });
  });

  it('credentialsExist', () => {
    return kuzzle.auth.credentialsExist('strategy', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            strategy: 'strategy',
            controller: 'auth',
            action: 'credentialsExist'
          }, options);
      });
  });

  it('deleteMyCredentials', () => {
    return kuzzle.auth.deleteMyCredentials('strategy', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            strategy: 'strategy',
            controller: 'auth',
            action: 'deleteMyCredentials'
          }, options);
      });
  });

  it('getCurrentUser', () => {
    kuzzle.query.resolves({
      id: 'id',
      _source: {
        name: 'Doe'
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

        should(user.id).eql('id');
        should(user.content).eql({name: 'Doe'});
      });
  });

  it('getMyCredentials', () => {
    return kuzzle.auth.getMyCredentials('strategy', options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            strategy: 'strategy',
            controller: 'auth',
            action: 'getMyCredentials'
          }, options);
      });
  });

  it('getMyRights', () => {
    kuzzle.query.resolves({hits: []});

    return kuzzle.auth.getMyRights(options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'auth',
            action: 'getMyRights'
          }, options);
      });
  });

  it('getStrategies', () => {
    return kuzzle.auth.getStrategies(options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'auth',
            action: 'getStrategies'
          }, options);
      });
  });

  it('login', () => {
    const credentials = {foo: 'bar'};

    kuzzle.query.resolves({jwt: 'jwt'});

    return kuzzle.auth.login('strategy', credentials, 'expiresIn')
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'auth',
            action: 'login',
            strategy: 'strategy',
            expiresIn: 'expiresIn',
            body: credentials
          }, {queuable: false});

        should(kuzzle.emit)
          .be.calledOnce()
          .be.calledWith('loginAttempt');

        should(kuzzle.jwt).eql('jwt');
      });
  });

  it('logout', () => {
    kuzzle.jwt = 'jwt';

    return kuzzle.auth.logout()
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'auth',
            action: 'logout'
          });

        should(kuzzle.jwt).be.undefined();
      });
  });

  it('updateMyCredentials', () => {
    const credentials = {foo: 'bar'};

    return kuzzle.auth.updateMyCredentials('strategy', credentials, options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'auth',
            action: 'updateMyCredentials',
            strategy: 'strategy',
            body: credentials
          }, options);
      });
  });

  it('updateSelf', () => {
    const body = {foo: 'bar'};

    return kuzzle.auth.updateSelf(body, options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            controller: 'auth',
            action: 'updateSelf',
            body
          }, options);

      });
  });

  it('validateMyCredentials', () => {
    const body = {foo: 'bar'};

    return kuzzle.auth.validateMyCredentials('strategy', body, options)
      .then(() => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith({
            strategy: 'strategy',
            body,
            controller: 'auth',
            action: 'validateMyCredentials'
          }, options);
      });
  });
});
