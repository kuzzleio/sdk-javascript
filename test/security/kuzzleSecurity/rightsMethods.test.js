var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../../src/Kuzzle');

describe('Security user rights methods', function () {
  var
    kuzzle,
    expectedQuery,
    result;

  var exampleRights = [
    {
      controller: 'read', action: 'get', index: '*', collection: '*',
      value: 'allowed'
    },
    {
      controller: 'read', action: 'count', index: '*', collection: '*',
      value: 'allowed'
    },
    {
      controller: 'read', action: 'search', index: '*', collection: '*',
      value: 'allowed'
    },
    {
      controller: 'read', action: '*', index: 'index1', collection: 'collection1',
      value: 'allowed'
    },
    {
      controller: 'read', action: '*', index: 'index1', collection: 'collection2',
      value: 'allowed'
    },
    {
      controller: 'write', action: 'update', index: '*', collection: '*',
      value: 'allowed'
    },
    {
      controller: 'write', action: 'create', index: '*', collection: '*',
      value: 'allowed'
    },
    {
      controller: 'write', action: 'createOrReplace', index: '*', collection: '*',
      value: 'allowed'
    },
    {
      controller: 'write', action: 'delete', index: '*', collection: '*',
      value: 'conditional'
    },
    {
      controller: 'write', action: 'publish', index: 'index2', collection: '*',
      value: 'allowed'
    },
    {
      controller: 'security', action: 'searchUsers', index: '*', collection: '*',
      value: 'allowed'
    },
    {
      controller: 'security', action: 'updateUser', index: '*', collection: '*',
      value: 'conditional'
    }
  ];

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
  });

  describe('#getUserRights', function () {
    beforeEach(function () {
      result = { result: { hits: exampleRights } };
      expectedQuery = {
        action: 'getUserRights',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.getUserRights('foobar', function (err, res) {
        should(err).be.null();
        should(res).be.exactly(exampleRights);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'foobar'}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should throw if called with no arguments', function () {
      should(function () {kuzzle.security.getUserRights();}).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should throw if called with no callback', function () {
      should(function () {kuzzle.security.getUserRights('foobar');}).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.getUserRights('foobar', function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });

    it('should call callback with an array containing rights (if not empty)', function (done) {
      this.timeout(50);

      kuzzle.security.getUserRights('foobar', function (err, res) {
        should(err).be.exactly(null);
        should(res).be.an.instanceOf(Array);

        should(res[0]).have.ownProperty('controller');
        should(res[0]).have.ownProperty('action');
        should(res[0]).have.ownProperty('index');
        should(res[0]).have.ownProperty('collection');
        should(res[0]).have.ownProperty('value');
        should(res[0].value).be.oneOf('allowed', 'denied', 'conditional');

        done();
      });

      kuzzle.query.yield(null, result);
    });
  });

  describe('#getMyRights', function () {
    beforeEach(function () {
      result = { result: { hits: exampleRights } };
      expectedQuery = {
        action: 'getMyRights',
        controller: 'auth'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      kuzzle.getMyRights(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(exampleRights);
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should throw if called with no callback', function () {
      should(function () {kuzzle.getMyRights();}).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.getMyRights(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });

    it('should call callback with an array containing rights (if not empty)', function (done) {
      this.timeout(50);

      kuzzle.getMyRights(function (err, res) {
        should(err).be.exactly(null);
        should(res).be.an.instanceOf(Array);

        should(res[0]).have.ownProperty('controller');
        should(res[0]).have.ownProperty('action');
        should(res[0]).have.ownProperty('index');
        should(res[0]).have.ownProperty('collection');
        should(res[0]).have.ownProperty('value');
        should(res[0].value).be.oneOf('allowed', 'denied', 'conditional');

        done();
      });

      kuzzle.query.yield(null, result);
    });
  });

  describe('#isActionAllowed', function () {
    it('should return "allowed" to ("read", "get")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'read', 'get'))
        .be.exactly('allowed');
    });

    it('should return "allowed" to ("read", "count", "myIndex")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'read', 'count', 'myIndex'))
        .be.exactly('allowed');
    });

    it('should return "allowed" to ("read", "search", "myIndex", "myCollection")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'read', 'search', 'myIndex', 'myCollection'))
        .be.exactly('allowed');
    });

    it('should return "allowed" to ("read", "search", "index1", "collection1")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'read', 'search', 'index1', 'collection1'))
        .be.exactly('allowed');
    });

    it('should return "denied" to ("read", "listIndexes", "index2")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'read', 'listIndexes', 'index2'))
        .be.exactly('denied');
    });

    it('should return "allowed" to ("read", "search", "index1", "collection2")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'read', 'search', 'index1', 'collection2'))
        .be.exactly('allowed');
    });

    it('should return "denied" to ("write", "replace")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'write', 'replace'))
        .be.exactly('denied');
    });

    it('should return "conditional" to ("security", "updateUser")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'security', 'updateUser'))
        .be.exactly('conditional');
    });

    it('should return "conditional" to ("write", "delete")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'write', 'delete'))
        .be.exactly('conditional');
    });

    it('should return "conditional" to ("write", "delete", "index1", "collection1")', function() {
      should(kuzzle.security.isActionAllowed(exampleRights, 'write', 'delete', 'index1', 'collection1'))
        .be.exactly('conditional');
    });

    it('should throw if called with no arguments', function () {
      should(function () {kuzzle.security.isActionAllowed();}).throw(Error);
    });

    it('should throw if called with no action, nor controller', function () {
      should(function () {kuzzle.security.isActionAllowed(exampleRights);}).throw(Error);
    });

    it('should throw if called with no action', function () {
      should(function () {kuzzle.security.isActionAllowed(exampleRights, 'write');}).throw(Error);
    });
  });
});
