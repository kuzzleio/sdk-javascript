var
  should = require('should'),
  sinon = require('sinon'),
  sandbox = sinon.sandbox.create(),
  Kuzzle = require('../../../src/Kuzzle');

describe('Credentials methods', function() {
  var kuzzle;

  describe('#createCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.security.createCredentials('strategy', 'kuid', {foo: 'bar'}, function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();
        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('createCredentials');
        should(args[2]).be.exactly(null);
        done();
      });

    });

    it('should call query with right arguments', function (done) {
      var
        doc = {_id: '42'},
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: {_source: doc}}),
        args;

      kuzzle.security.createCredentials('strategy', 'kuid', {foo: 'bar'}, function (err, res) {
        should(res).be.exactly(doc);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('createCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#deleteCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.security.deleteCredentials('strategy', 'kuid', function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();
        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('deleteCredentials');
        should(args[2]).be.exactly(null);
        done();
      });

    });

    it('should call query with right arguments', function (done) {
      var
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: {acknowledged: true}}),
        args;

      kuzzle.security.deleteCredentials('strategy', 'kuid', function (err, res) {
        should(res.acknowledged).be.exactly(true);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('deleteCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#getAllCredentialFields', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.security.getAllCredentialFields(function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('getAllCredentialFields');
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = ['usernae'],
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: doc}),
        args;

      kuzzle.security.getAllCredentialFields(function (err, res) {
        should(res).be.exactly(doc);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('getAllCredentialFields');
        done();
      });
    });
  });

  describe('#getCredentialFields', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.security.getCredentialFields('strategy', function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('getCredentialFields');
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = ['usernae'],
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: doc}),
        args;

      kuzzle.security.getCredentialFields('strategy', function (err, res) {
        should(res).be.exactly(doc);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('getCredentialFields');
        done();
      });
    });
  });

  describe('#getCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.security.getCredentials('strategy', 'kuid', function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('getCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = {_id: '42'},
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: doc}),
        args;

      kuzzle.security.getCredentials('strategy', 'kuid', function (err, res) {
        should(res).be.exactly(doc);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('getCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#hasCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.security.hasCredentials('strategy', 'kuid', function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('hasCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: true}),
        args;

      kuzzle.security.hasCredentials('strategy', 'kuid', function (err, res) {
        should(res).be.exactly(true);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('hasCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#updateCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.security.updateCredentials('strategy', 'kuid', {username: 'foo'}, function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('updateCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = {username: 'foo'},
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: doc}),
        args;

      kuzzle.security.updateCredentials('strategy', 'kuid', doc, function (err, res) {
        should(res).be.exactly(doc);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('updateCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });

  describe('#validateCredentials', function() {
    beforeEach(function() {
      kuzzle = new Kuzzle('foo');
    });

    it('should trigger callback with an error', function (done) {
      var
        cberror = {message: 'i am an error'},
        spy = sandbox.stub(kuzzle, 'query').yields(cberror),
        args;

      kuzzle.security.validateCredentials('strategy', 'kuid', {username: 'foo'}, function (err) {
        should(err).be.exactly(cberror);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('validateCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });

    it('should call query with right arguments', function (done) {
      var
        doc = {username: 'foo'},
        spy = sandbox.stub(kuzzle, 'query').yields(null, {result: true}),
        args;

      kuzzle.security.validateCredentials('strategy', 'kuid', doc, function (err, res) {
        should(res).be.exactly(true);
        args = spy.firstCall.args;

        should(spy.calledOnce).be.true();

        should(args[0].controller).be.exactly('security');
        should(args[0].action).be.exactly('validateCredentials');
        should(args[2]).be.exactly(null);
        done();
      });
    });
  });
});
