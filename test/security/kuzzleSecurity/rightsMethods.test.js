var
  should = require('should'),
  Kuzzle = require('../../../src/Kuzzle');

describe('Security user rights methods', function () {
  var
    kuzzle,
    expectedQuery,
    result,
    error,
    queryStub = function (args, query, options, cb) {
      should(args.controller).be.exactly(expectedQuery.controller);
      should(args.action).be.exactly(expectedQuery.action);

      if (expectedQuery.options) {
        should(options).match(expectedQuery.options);
      }

      if (expectedQuery.body) {
        if (!query.body) {
          query.body = {};
        }

        should(query.body).match(expectedQuery.body);
      } else {
        should(query.body).be.undefined();
      }

      if (expectedQuery._id) {
        should(query._id).be.exactly(expectedQuery._id);
      }

      if (cb) {
        if (error) {
          return cb(error);
        }

        cb(error, result);
      }
    };

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

  describe('#getUserRights', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: { hits: exampleRights } };
      expectedQuery = {
        action: 'getUserRights',
        controller: 'security',
        _id: 'foobar'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      should(kuzzle.security.getUserRights(expectedQuery._id, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(exampleRights);
        done();
      }));
    });

    it('should throw if called with no arguments', function () {
      should(function () {kuzzle.security.getUserRights();}).throw(Error);
    });

    it('should throw if called with no callback', function () {
      should(function () {kuzzle.security.getUserRights(expectedQuery._id);}).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.getUserRights(expectedQuery._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should call callback with an array', function (done) {
      should(kuzzle.security.getUserRights(expectedQuery._id, function (err, res) {
        should(err).be.exactly(null);
        should(res).be.an.instanceOf(Array);
        done();
      }));
    });

    it('should call callback with an array containing rights (if not empty)', function (done) {
      should(kuzzle.security.getUserRights(expectedQuery._id, function (err, res) {
        should(err).be.exactly(null);
        should(res).be.an.instanceOf(Array);

        if (res.length > 0) {
          should(res[0]).have.ownProperty('controller');
          should(res[0]).have.ownProperty('action');
          should(res[0]).have.ownProperty('index');
          should(res[0]).have.ownProperty('collection');
          should(res[0]).have.ownProperty('value');
          should(res[0].value).be.oneOf('allowed', 'denied', 'conditional');
        }

        done();
      }));
    });
  });

  describe('#getMyRights', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: { hits: exampleRights } };
      expectedQuery = {
        action: 'getMyRights',
        controller: 'auth'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      should(kuzzle.getMyRights(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(exampleRights);
        done();
      }));
    });

    it('should throw if called with no callback', function () {
      should(function () {kuzzle.getMyRights();}).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';
      this.timeout(50);

      kuzzle.getMyRights(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should call callback with an array', function (done) {
      should(kuzzle.getMyRights(function (err, res) {
        should(err).be.exactly(null);
        should(res).be.an.instanceOf(Array);
        done();
      }));
    });

    it('should call callback with an array containing rights (if not empty)', function (done) {
      should(kuzzle.getMyRights(function (err, res) {
        should(err).be.exactly(null);
        should(res).be.an.instanceOf(Array);

        if (res.length > 0) {
          should(res[0]).have.ownProperty('controller');
          should(res[0]).have.ownProperty('action');
          should(res[0]).have.ownProperty('index');
          should(res[0]).have.ownProperty('collection');
          should(res[0]).have.ownProperty('value');
          should(res[0].value).be.oneOf('allowed', 'denied', 'conditional');
        }

        done();
      }));
    });
  });

  describe('#isActionAllowed', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    });

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
