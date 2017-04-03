var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle Login', function () {
  var
    kuzzle,
    queryStub;

  beforeEach(function() {
    kuzzle = new Kuzzle('somewhere', {
      connect: 'manual'
    });
    queryStub = sinon.stub(kuzzle, 'query');
  });
  afterEach(function() {
    queryStub.restore();
  });

  it('should have the token in login callback', function (done) {
    var loginCredentials = {username: 'foo', password: 'bar'};

    this.timeout(200);

    kuzzle.query = function(queryArgs, query, options, cb) {
      cb(null, {result: {jwt: 'test-toto'}});
    };

    kuzzle.login('local', loginCredentials, '1h', function() {
      should(kuzzle.jwtToken).be.exactly('test-toto');
      done();
    });
  });

  it('should handle login with only one argument and without callback', function () {
    kuzzle.login('local');
    should(queryStub).be.calledOnce();
  });

  it('should handle login with credentials and without callback', function () {
    var loginCredentials = {username: 'foo', password: 'bar'};

    kuzzle.login('local', loginCredentials);
    should(queryStub).be.calledOnce();
  });

  it('should handle login without credentials, with expiresIn and without callback', function () {
    kuzzle.login('local', '1h');
    should(queryStub).be.calledOnce();
  });

  it('should handle login without credentials, with expiresIn and with callback', function (done) {
    this.timeout(200);

    kuzzle.query = function(queryArgs, query, options, cb) {
      cb(null, {result: {jwt: 'test-toto'}});
    };

    kuzzle.login('local', '1h', function() {
      done();
    });
  });

  it('should handle login without credentials, without expiresIn and with callback', function (done) {
    this.timeout(200);

    kuzzle.query = function(queryArgs, query, options, cb) {
      cb(null, {result: {jwt: 'test-toto'}});
    };

    kuzzle.login('local', function() {
      done();
    });
  });

  it('should handle login with credentials', function (done) {
    var loginCredentials = {username: 'foo', password: 'bar'};

    this.timeout(200);

    kuzzle.query = function(queryArgs, query, options, cb) {
      cb(null, {result: {jwt: 'test-toto'}});
    };

    kuzzle.login('local', loginCredentials, function() {
      done();
    });
  });

  it('should send a failed loginAttempt event if logging in fails', function (done) {
    var eventEmitted = false;

    kuzzle.query = function(queryArgs, query, options, cb) {
      cb({message: 'foobar'});
    };

    kuzzle.addListener('loginAttempt', function (status) {
      should(status.success).be.false();
      should(status.error).be.eql('foobar');
      eventEmitted = true;
    });

    kuzzle.login('local', {});

    setTimeout(function () {
      should(eventEmitted).be.true();
      done();
    }, 0);
  });

  it('should not forward an event if there is no JWT token in the response', function (done) {
    kuzzle.query = function(queryArgs, query, options, cb) {
      cb(null, {result: {}});
    };

    kuzzle.addListener('loginAttempt', function () {
      done('test failed');
    });

    kuzzle.login('local', {});

    setTimeout(function () {
      done();
    }, 0);
  });

  it('should handle optional arguments correctly', function () {
    var loginCredentials = {username: 'foo', password: 'bar'};

    kuzzle.login('local', loginCredentials, function () {});
    kuzzle.login('local', loginCredentials, '1h', function () {});
    should(queryStub.firstCall).be.calledWithMatch(
      {controller: 'auth', action: 'login'},
      {body: {strategy: 'local', username: 'foo', password: 'bar'}}
    );
    should(queryStub.secondCall).be.calledWithMatch(
      {controller: 'auth', action: 'login'},
      {body: {strategy: 'local', username: 'foo', password: 'bar', expiresIn: '1h'}}
    );
  });

  it('should have a empty token in logout callback', function () {
    var unsetJwtToken = sinon.spy(kuzzle, 'unsetJwtToken');

    kuzzle.logout();
    should(unsetJwtToken).be.calledOnce();
  });

  it('should give an error if logout query fail to the logout callback if is set', function (done) {
    kuzzle.query = function(queryArgs, query, options, cb) {
      cb(new Error());
    };

    try {
      kuzzle.logout(function(error) {
        should(error).be.an.instanceOf(Error);
        done();
      });
    }
    catch (err) {
      done(err);
    }
  });

  it('should give an error if login query fail to the login callback if is set', function (done) {
    var loginCredentials = {username: 'foo', password: 'bar'};

    kuzzle.query = function(queryArgs, query, options, cb) {
      cb(new Error());
    };

    try {
      kuzzle.login('local', loginCredentials, '1h', function(error) {
        should(error).be.an.instanceOf(Error);
        done();
      });
    }
    catch (err) {
      done(err);
    }
  });

  it('should be able to send a login request', function () {
    var loginCredentials = {username: 'foo', password: 'bar'};

    kuzzle.login('local', loginCredentials, '1h');
    should(queryStub).be.calledWithMatch(
      {controller: 'auth', action: 'login'},
      {body: {strategy: 'local', username: 'foo', password: 'bar', expiresIn: '1h'}},
      {queuable: false}
    );
  });
});
