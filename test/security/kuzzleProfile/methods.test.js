var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../../src/Kuzzle'),
  Profile = require('../../../src/security/Profile');

describe('Profile methods', function () {
  var
    kuzzle,
    profile,
    result,
    expectedQuery;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
  });

  describe('#save', function () {
    beforeEach(function () {
      result = { result: {_id: 'myProfile', _source: {policies : []}} };
      profile = new Profile(kuzzle.security, 'myProfile', {policies : []});
      expectedQuery = {
        action: 'createOrReplaceProfile',
        controller: 'security'
      };
    });

    it('should throw an error if the profile has no "roles" parameter', function () {
      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content'});

      should((function () {profile.save();})).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      should(profile.save(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);
        should(res.id).be.exactly('myProfile');
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myProfile', body: {policies: []}, meta: {}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      profile.save(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#update', function () {
    beforeEach(function () {
      result = { result: {_id: 'myProfile', _index: '%kuzzle', _type: 'profiles'} };
      profile = new Profile(kuzzle.security, 'myProfile', {policies : []});
      expectedQuery = {
        action: 'updateProfile',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      should(profile.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myProfile', body: {foo: 'bar'}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      profile.update({'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });

    it('should raise an error if no content given', function () {
      should(function() {profile.update();}).throw(Error);
      should(kuzzle.query).not.be.called();
    });
  });

  describe('#addPolicy', function () {
    beforeEach(function () {
      profile = new Profile(kuzzle.security, 'myProfile', {policies: [{roleId:'role1'}]});
    });

    it('should throw an error if the policy parameter is not an object', function () {
      should((function () {profile.addPolicy(null);})).throw(Error);
    });

    it('should throw an error if the policy.roleId parameter is not a string', function () {
      should((function () {profile.addPolicy({roleId: null});})).throw(Error);
    });

    it('should add the right policy in policies list', function () {
      profile.addPolicy({roleId: 'role2'});
      should(profile.content.policies).be.an.Array().match([{roleId: 'role1'}, {roleId: 'role2'}]);
      should(profile.content.policies.length).be.exactly(2);
    });

    it('should initialize policies with array if no policy was set before', function () {
      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content'});

      profile.addPolicy({roleId: 'role'});
      should(profile.content.policies).be.an.Array();
      should(profile.content.policies.length).be.exactly(1);
    });
  });

  describe('#setPolicies', function () {
    beforeEach(function () {
      profile = new Profile(kuzzle.security, 'myProfile', {policies: [{roleId:'role1'}]});
    });

    it('should throw an error if the policies parameter is null', function () {
      should((function () {profile.setPolicies(null);})).throw(Error);
    });

    it('should throw an error if the role parameter is not a array of objects', function () {
      should((function () {profile.setPolicies([1, 2, 3]);})).throw(Error);
    });

    it('should add the policy in policies list', function () {
      profile.setPolicies([{roleId:'role2'}]);
      should(profile.content.policies).be.an.Array().match([{roleId:'role2'}]);
      should(profile.content.policies.length).be.exactly(1);

      profile.setPolicies([{roleId:'role1'}, {roleId:'role2'}]);
      should(profile.content.policies).be.an.Array().match([{roleId:'role1'}, {roleId:'role2'}]);
      should(profile.content.policies.length).be.exactly(2);
    });
  });

  describe('#serialize', function () {
    beforeEach(function () {
      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content', policies: [{roleId:'role1'}]}, {createdAt: '123456789'});
    });

    it('should serialize with correct attributes', function () {
      var serialized = profile.serialize();

      should(serialized._id).be.exactly('myProfile');
      should(serialized.body).match({some: 'content', policies: [{roleId:'role1'}]});
      should(serialized.meta).match({createdAt: '123456789'});
    });

    it('should serialize without policies if no policies attribute is defined', function () {
      var
        serialized;

      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content'}, {createdAt: '123456789'});

      serialized = profile.serialize();

      should(serialized._id).be.exactly('myProfile');
      should(serialized.meta).match({createdAt: '123456789'});
      should.exist(serialized.body.some);
      should.not.exist(serialized.body.policies);
    });
  });

  describe('#delete', function () {
    beforeEach(function () {
      result = { result: {_id: 'myProfile'} };
      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content', roles: [{roleId:'role1'}]});
      expectedQuery = {
        action: 'deleteProfile',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      should(profile.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly('myProfile');
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myProfile'}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      profile.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#getPolicies', function () {
    it('should return the associated policies', function () {
      var policies = [{roleId:'role1'}, {roleId:'role2'}, {roleId:'role3'}];

      profile = new Profile(kuzzle.security, 'myProfile', {some: 'content', policies: policies});
      should(profile.getPolicies()).be.eql(policies);
    });
  });
});
