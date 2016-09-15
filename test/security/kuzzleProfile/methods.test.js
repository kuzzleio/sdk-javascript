var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleProfile = require('../../../src/security/kuzzleProfile'),
  KuzzleRole = require('../../../src/security/kuzzleRole');

describe('KuzzleProfile methods', function () {
  var
    kuzzle,
    kuzzleProfile,
    result,
    expectedQuery,
    error = null,
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

  describe('#save', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = null;

      result = { result: {_id: 'myProfile', _source: {policies : []}} };
      kuzzleProfile = new KuzzleProfile(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'createOrReplaceProfile',
        controller: 'security'
      };
    });

    it('should throw an error if the profile has not roles parameter', function (done) {
      kuzzleProfile = new KuzzleProfile(kuzzle.security, result.result._id, {some: 'content'});

      should((function () {
        kuzzleProfile.save();
      })).throw(Error);

      done();
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleProfile.save(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleProfile);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      error = 'foobar';
      this.timeout(50);

      kuzzleProfile.save(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#update', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = null;

      result = { result: {_id: 'myProfile', _index: '%kuzzle', _type: 'profiles'} };
      kuzzleRole = new KuzzleRole(kuzzle.security, result.result._id, {indexes : {}});
      expectedQuery = {
        action: 'updateProfile',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzleProfile.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleProfile);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      error = 'foobar';
      this.timeout(50);

      kuzzleProfile.update({'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should raise an error if no content given', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      this.timeout(50);

      try {
        kuzzleProfile.update();
      }
      catch(error) {
        should(error).be.instanceOf(Error);
        done();
      }
    });
  });

  describe('#addPolicy', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {policies: [{roleId:'role1'}]});
    });

    it('should throw an error if the policy parameter is not an object', function (done) {
      should((function () {
        kuzzleProfile.addPolicy(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the policy.roleId parameter is not a string', function (done) {
      should((function () {
        kuzzleProfile.addPolicy({roleId: null});
      })).throw(Error);

      done();
    });

    it('should add the right policy in policies list', function (done) {
      kuzzleProfile.addPolicy({roleId: 'role2'});
      should(kuzzleProfile.content.policies).be.an.Array().match([{roleId: 'role1'}, {roleId: 'role2'}]);
      should(kuzzleProfile.content.policies.length).be.exactly(2);
      done();
    });

    it('should initialize policies with array if no policy was set before', function (done) {
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content'});

      kuzzleProfile.addPolicy({roleId: 'role'});
      should(kuzzleProfile.content.policies).be.an.Array();
      should(kuzzleProfile.content.policies.length).be.exactly(1);
      done();
    });
  });

  describe('#setPolicies', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {policies: [{roleId:'role1'}]});
    });

    it('should throw an error if the policies parameter is null', function (done) {
      should((function () {
        kuzzleProfile.setPolicies(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the role parameter is not a array of objects', function (done) {
      should((function () {
        kuzzleProfile.setPolicies([1, 2, 3]);
      })).throw(Error);

      done();
    });

    it('should add the policy in policies list', function (done) {
      kuzzleProfile.setPolicies([{roleId:'role2'}]);
      should(kuzzleProfile.content.policies).be.an.Array().match([{roleId:'role2'}]);
      done();
    });

    it('should add the KuzzleRole in roles list', function (done) {
      kuzzleProfile.setPolicies([{roleId:'role1'}, {roleId:'role2'}]);
      should(kuzzleProfile.content.policies).be.an.Array();
      should(kuzzleProfile.content.policies.length).be.exactly(2);
      done();
    });
  });

  describe('#serialize', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content', policies: [{roleId:'role1'}]});
    });

    it('should serialize with correct attributes', function (done) {
      var serialized = kuzzleProfile.serialize();

      should(serialized._id).be.exactly('myProfile');
      should(serialized.body).be.match({some: 'content', policies: [{roleId:'role1'}]});
      done();
    });

    it('should serialize without policies if no policies attribute is defined', function (done) {
      var
        serialized;

      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content'});

      serialized = kuzzleProfile.serialize();

      should(serialized._id).be.exactly('myProfile');
      should.exist(serialized.body.some);
      should.not.exist(serialized.body.policies);
      done();
    });
  });

  describe('#delete', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = null;

      result = { result: {_id: 'myProfile'} };
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content', roles: [{roleId:'role1'}]});
      expectedQuery = {
        action: 'deleteProfile',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleProfile.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      error = 'foobar';

      kuzzleProfile.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#getPolicies', function () {
    it('should return the associated policies', function () {
      var policies = [{roleId:'role1'}, {roleId:'role2'}, {roleId:'role3'}];

      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content', policies: policies});
      should(kuzzleProfile.getPolicies()).be.eql(policies);
    });
  });
});
