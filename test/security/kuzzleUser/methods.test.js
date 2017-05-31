var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../../src/Kuzzle'),
  User = require('../../../src/security/User'),
  sandbox = sinon.sandbox.create();

describe('User methods', function () {
  var
    content = {some: 'content', profileIds: ['myProfile']},
    kuzzle,
    kuzzleUser,
    result,
    expectedQuery;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
  });

  describe('#create', function () {
    beforeEach(function () {
      sandbox.reset();
      result = { result: {_id: 'myUser', _source: {some: 'content', profileIds: ['myProfile']}} };
      kuzzleUser = new User(kuzzle.security, result.result._id, result.result._source);
    });

    it('should throw an error if the user has not profile parameter', function (done) {
      kuzzleUser = new User(kuzzle.security, result.result._id, {some: 'content'});

      should((function () {
        kuzzleUser.create();
      })).throw(Error);

      done();
    });

    it('should call createUser if the user does not exist', function (done) {
      kuzzle.query = sandbox.stub();
      kuzzle.query
        .onCall(0).callsArgWith(3, null);

      should(kuzzleUser.create(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        should(kuzzle.query.args[0][0]).be.match({
          controller: 'security',
          action: 'createUser'
        });
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      kuzzle.query = sandbox.stub();
      kuzzle.query
        .onCall(0).callsArgWith(3, 'error');

      kuzzleUser.create(function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#replace', function () {
    beforeEach(function () {
      sandbox.reset();
      kuzzle = new Kuzzle('http://localhost:7512');
      result = {result: {_id: 'myUser', _source: {some: 'content', profileIds: ['myProfile']}}};
      kuzzleUser = new User(kuzzle.security, result.result._id, result.result._source);
    });


    it('should throw an error if the user has not profile parameter', function (done) {
      kuzzleUser = new User(kuzzle.security, result.result._id, {some: 'content'});

      should((function () {
        kuzzleUser.replace();
      })).throw(Error);

      done();
    });

    it('should call replaceUser if the user already exist', function (done) {
      kuzzle.query = sandbox.stub();
      kuzzle.query
        .onCall(0).callsArgWith(3, null);

      should(kuzzleUser.replace(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        should(kuzzle.query.args[0][0]).be.match({
          controller: 'security',
          action: 'replaceUser'
        });
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      kuzzle.query = sandbox.stub();
      kuzzle.query
        .onCall(0).callsArgWith(3, 'error');

      kuzzleUser.replace(function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#saveRestricted', function () {
    beforeEach(function () {
      result = { result: {_id: 'myUser', _source: {some: 'content'}} };
      kuzzleUser = new User(kuzzle.security, 'myUser', {some: 'content'});
      expectedQuery = {
        action: 'createRestrictedUser',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      should(kuzzleUser.saveRestricted(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myUser', body: {some: 'content'}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzleUser.saveRestricted(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#update', function () {
    beforeEach(function () {
      result = { result: {_id: 'myUser', _index: '%kuzzle', _type: 'users'} };
      kuzzleUser = new User(kuzzle.security, 'myUser', content);
      expectedQuery = {
        action: 'updateUser',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      should(kuzzleUser.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myUser', body: {foo: 'bar'}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzleUser.update({'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });

    it('should raise an error if no content given', function () {
      should(function() {kuzzleUser.update();}).throw(Error);
      should(kuzzle.query).not.be.called();
    });
  });

  describe('#setProfiles', function () {
    beforeEach(function () {
      kuzzleUser = new User(kuzzle.security, 'myUser', {profileIds: ['profile1']});
    });

    it('should throw an error if the profileIds parameter is null', function () {
      should((function () {kuzzleUser.setProfiles(null);})).throw(Error);
    });

    it('should throw an error if the profileIds parameter is not an array', function () {
      should((function () {kuzzleUser.setProfiles(1);})).throw(Error);
    });

    it('should throw an error if the profileIds parameter is not an array of strings', function () {
      should((function () {kuzzleUser.setProfiles([1]);})).throw(Error);
    });

    it('should add the rights profiles IDs in profileIds', function () {
      kuzzleUser.setProfiles(['profile2']);
      should(kuzzleUser.content.profileIds).be.eql(['profile2']);
    });
  });

  describe('#addProfile', function () {
    beforeEach(function () {
      kuzzleUser = new User(kuzzle.security, 'myUser', {profileIds: ['profile1']});
    });

    it('should throw an error if the profileId parameter is null', function () {
      should((function () {kuzzleUser.addProfile(null);})).throw(Error);
    });

    it('should throw an error if the profileId parameter is not a string', function () {
      should((function () {kuzzleUser.addProfile(42);})).throw(Error);
    });

    it('should add the profile if it does not already exists in list', function () {
      kuzzleUser.addProfile('profile2');
      should(kuzzleUser.content.profileIds).be.eql(['profile1', 'profile2']);
    });

    it('should not add the profile if it already exists in list', function () {
      kuzzleUser.addProfile('profile1');
      should(kuzzleUser.content.profileIds).be.eql(['profile1']);
    });

    it('should add the profile even if no profileIds are currently set', function () {
      delete kuzzleUser.content.profileIds;
      kuzzleUser.addProfile('profile1');

      should(kuzzleUser.content.profileIds).be.eql(['profile1']);
    });
  });

  describe('#serialize', function () {
    beforeEach(function () {
      kuzzleUser = new User(kuzzle.security, 'user', {some: 'content', profileIds: ['profile']});
    });

    it('should serialize with correct attributes', function () {
      var serialized = kuzzleUser.serialize();

      should(serialized._id).be.exactly('user');
      should(serialized.body).be.match({some: 'content', profileIds: ['profile']});
    });
  });

  describe('#creationSerialize', function () {
    beforeEach(function () {
      kuzzleUser = new User(kuzzle.security, 'user', {some: 'content', profileIds: ['profile']});
      kuzzleUser.setCredentials({some: 'credentials'});
    });

    it('should serialize with correct attributes', function () {
      var serialized = kuzzleUser.creationSerialize();

      should(serialized._id).be.exactly('user');
      should(serialized.body).be.match({content: {some: 'content', profileIds: ['profile']}, credentials: {some: 'credentials'}});
    });
  });

  describe('#delete', function () {
    beforeEach(function () {
      result = { result: {_id: 'user'} };
      kuzzleUser = new User(kuzzle.security, 'myUser', {some: 'content', profileIds: ['profile']});
      expectedQuery = {
        action: 'deleteUser',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      should(kuzzleUser.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myUser'}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzleUser.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#getProfileIds', function () {
    it('should return the associated profiles', function () {
      var profileIds = ['profile'];
      kuzzleUser = new User(kuzzle.security, 'user', {some: 'content', profileIds: profileIds});
      should(kuzzleUser.getProfileIds()).be.eql(profileIds);
    });

    it('should return an empty array if no profile ID is attached', function () {
      kuzzleUser = new User(kuzzle.security, 'foo', {});
      should(kuzzleUser.getProfileIds()).be.an.Array().and.be.empty();
    });
  });

  describe('#getProfiles', function () {
    
  });
});
