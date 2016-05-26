var
  should = require('should'),
  Kuzzle = require('../../../src/kuzzle');

describe('isActionAllowed', function () {
  var examplePolicies = [
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

  describe('#isActionAllowed', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    });

    it('should return "allowed" to ("read", "get")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'read', 'get'))
        .be.exactly('allowed');
    });

    it('should return "allowed" to ("read", "count", "myIndex")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'read', 'count', 'myIndex'))
        .be.exactly('allowed');
    });

    it('should return "allowed" to ("read", "search", "myIndex", "myCollection")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'read', 'search', 'myIndex', 'myCollection'))
        .be.exactly('allowed');
    });

    it('should return "allowed" to ("read", "search", "index1", "collection1")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'read', 'search', 'index1', 'collection1'))
        .be.exactly('allowed');
    });

    it('should return "denied" to ("read", "listIndexes", "index2")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'read', 'listIndexes', 'index2'))
        .be.exactly('denied');
    });

    it('should return "allowed" to ("read", "search", "index1", "collection2")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'read', 'search', 'index1', 'collection2'))
        .be.exactly('allowed');
    });

    it('should return "denied" to ("write", "replace")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'write', 'replace'))
        .be.exactly('denied');
    });

    it('should return "conditional" to ("security", "updateUser")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'security', 'updateUser'))
        .be.exactly('conditional');
    });

    it('should return "conditional" to ("write", "delete")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'write', 'delete'))
        .be.exactly('conditional');
    });

    it('should return "conditional" to ("write", "delete", "index1", "collection1")', function() {
      should(kuzzle.security.isActionAllowed(examplePolicies, 'write', 'delete', 'index1', 'collection1'))
        .be.exactly('conditional');
    });

    it('should throw if called with no arguments', function () {
      should(function () { kuzzle.security.isActionAllowed() }).throw(Error);
    });

    it('should throw if called with no action, nor controller', function () {
      should(function () { kuzzle.security.isActionAllowed(examplePolicies) }).throw(Error);
    });

    it('should throw if called with no action', function () {
      should(function () { kuzzle.security.isActionAllowed(examplePolicies, 'write') }).throw(Error);
    });
  });
});
