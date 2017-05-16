var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle Login', function () {
  var
    sandbox = sinon.sandbox.create(),
    loginCredentials = {username: 'foo', password: 'bar'},
    kuzzle;

  beforeEach(function() {
    kuzzle = new Kuzzle('somewhere', {connect: 'manual', eventTimeout: 0});
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('# with callback', function () {
    var queryStub;

    beforeEach(function() {
      queryStub = sandbox.stub(kuzzle, 'query', function(queryArgs, query, options, cb) {
        cb(null, {result: {jwt: 'test-toto'}});
      });
    });

    it('should handle login with only the strategy', function (done) {
      kuzzle.login('local', function() {
        should(queryStub).be.calledOnce();
        done();
      });
    });

    it('should handle login with credentials', function (done) {
      kuzzle.login('local', loginCredentials, function() {
        should(queryStub).be.calledOnce();
        done();
      });
    });

    it('should handle login without credentials and with expiresIn', function (done) {
      kuzzle.login('local', '1h', function() {
        should(queryStub).be.calledOnce();
        done();
      });
    });

    it('should have the token in login callback', function (done) {
      kuzzle.login('local', loginCredentials, '1h', function() {
        should(kuzzle.jwtToken).be.exactly('test-toto');
        done();
      });
    });
  });

  describe('# without callback', function () {
    var queryStub;

    beforeEach(function() {
      queryStub = sandbox.stub(kuzzle, 'query');
    });

    it('should handle login with only the strategy', function () {
      kuzzle.login('local');
      should(queryStub).be.calledOnce();
    });

    it('should handle login with credentials', function () {
      kuzzle.login('local', loginCredentials);
      should(queryStub).be.calledOnce();
    });

    it('should handle login without credentials and with expiresIn', function () {
      kuzzle.login('local', '1h');
      should(queryStub).be.calledOnce();
    });

    it('should handle optional arguments correctly', function () {
      kuzzle.login('local', loginCredentials);
      kuzzle.login('local', loginCredentials, '1h');
      should(queryStub.firstCall).be.calledWith(
        {controller: 'auth', action: 'login'},
        {body: {strategy: 'local', username: 'foo', password: 'bar'}},
        {queuable: false}
      );
      should(queryStub.secondCall).be.calledWith(
        {controller: 'auth', action: 'login'},
        {body: {strategy: 'local', username: 'foo', password: 'bar', expiresIn: '1h'}},
        {queuable: false}
      );
    });
  });


  describe('#Error Login', function () {
    it('should send a failed loginAttempt event if logging in fails', function (done) {
      sandbox.stub(kuzzle, 'query', function(queryArgs, query, options, cb) {
        cb({message: 'foobar'});
      });

      kuzzle.addListener('loginAttempt', function (status) {
        should(status.success).be.false();
        should(status.error).be.eql('foobar');
        done();
      });

      kuzzle.login('local', {});
    });

    it('should not forward an event if there is no JWT token in the response', function (done) {
      var loginAttemptStub = sinon.stub();
      sandbox.stub(kuzzle, 'query', function(queryArgs, query, options, cb) {
        cb(null, {result: {}});
      });

      kuzzle.addListener('loginAttempt', loginAttemptStub);

      kuzzle.login('local', {});

      process.nextTick(function () {
        should(loginAttemptStub).not.be.called();
        done();
      });
    });

    it('should give an error if login query fail to the login callback if is set', function (done) {
      sandbox.stub(kuzzle, 'query', function(queryArgs, query, options, cb) {
        cb(new Error());
      });

      kuzzle.login('local', loginCredentials, '1h', function(error) {
        should(error).be.an.instanceOf(Error);
        done();
      });
    });
  });

  describe('#Logout', function () {
    it('should have a empty token in logout callback', function () {
      var unsetJwtToken = sinon.spy(kuzzle, 'unsetJwtToken');

      kuzzle.logout();
      should(unsetJwtToken).be.calledOnce();
    });

    it('should give an error if logout query fail to the logout callback if is set', function (done) {
      sandbox.stub(kuzzle, 'query', function(queryArgs, query, options, cb) {
        cb(new Error());
      });

      kuzzle.logout(function(error) {
        should(error).be.an.instanceOf(Error);
        done();
      });
    });
  });
});
