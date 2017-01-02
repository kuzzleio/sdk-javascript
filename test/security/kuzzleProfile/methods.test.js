var
  should = require('should'),
  Kuzzle = require('../../../src/Kuzzle'),
  Profile = require('../../../src/security/Profile'),
  Role = require('../../../src/security/Role');

describe('Profile methods', function () {
  var
    kuzzle,
    profile,
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
      profile = new Profile(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'createOrReplaceProfile',
        controller: 'security'
      };
    });

    it('should throw an error if the profile has not roles parameter', function (done) {
      profile = new Profile(kuzzle.security, result.result._id, {some: 'content'});

      should((function () {
        profile.save();
      })).throw(Error);

      done();
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(profile.save(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      error = 'foobar';
      this.timeout(50);

      profile.save(function (err, res) {
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
      role = new Role(kuzzle.security, result.result._id, {indexes : {}});
      expectedQuery = {
        action: 'updateProfile',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(profile.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      error = 'foobar';
      this.timeout(50);

      profile.update({'foo': 'bar'}, function (err, res) {
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
        profile.update();
      }
      catch (e) {
        should(e).be.instanceOf(Error);
        done();
      }
    });
  });

  describe('#addPolicy', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      profile = new Profile(kuzzle.security, 'myProfile', {policies: [{roleId:'role1'}]});
    });

    it('should throw an error if the policy parameter is not an object', function (done) {
      should((function () {
        profile.addPolicy(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the policy.roleId parameter is not a string', function (done) {
      should((function () {
        profile.addPolicy({roleId: null});
      })).throw(Error);

      done();
    });

    it('should add the right policy in policies list', function (done) {
      profile.addPolicy({roleId: 'role2'});
      should(profile.content.policies).be.an.Array().match([{roleId: 'role1'}, {roleId: 'role2'}]);
      should(profile.content.policies.length).be.exactly(2);
      done();
    });

    it('should initialize policies with array if no policy was set before', function (done) {
      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content'});

      profile.addPolicy({roleId: 'role'});
      should(profile.content.policies).be.an.Array();
      should(profile.content.policies.length).be.exactly(1);
      done();
    });
  });

  describe('#setPolicies', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      profile = new Profile(kuzzle.security, 'myProfile', {policies: [{roleId:'role1'}]});
    });

    it('should throw an error if the policies parameter is null', function (done) {
      should((function () {
        profile.setPolicies(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the role parameter is not a array of objects', function (done) {
      should((function () {
        profile.setPolicies([1, 2, 3]);
      })).throw(Error);

      done();
    });

    it('should add the policy in policies list', function (done) {
      profile.setPolicies([{roleId:'role2'}]);
      should(profile.content.policies).be.an.Array().match([{roleId:'role2'}]);
      done();
    });

    it('should add the Role in roles list', function (done) {
      profile.setPolicies([{roleId:'role1'}, {roleId:'role2'}]);
      should(profile.content.policies).be.an.Array();
      should(profile.content.policies.length).be.exactly(2);
      done();
    });
  });

  describe('#serialize', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content', policies: [{roleId:'role1'}]});
    });

    it('should serialize with correct attributes', function (done) {
      var serialized = profile.serialize();

      should(serialized._id).be.exactly('myProfile');
      should(serialized.body).be.match({some: 'content', policies: [{roleId:'role1'}]});
      done();
    });

    it('should serialize without policies if no policies attribute is defined', function (done) {
      var
        serialized;

      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content'});

      serialized = profile.serialize();

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
      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content', roles: [{roleId:'role1'}]});
      expectedQuery = {
        action: 'deleteProfile',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(profile.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      error = 'foobar';

      profile.delete(function (err, res) {
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
      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content', policies: policies});
      should(profile.getPolicies()).be.eql(policies);
    });
  });
});
