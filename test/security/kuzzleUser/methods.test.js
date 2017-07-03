var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../../src/Kuzzle'),
  User = require('../../../src/security/User'),
  Profile = require('../../../src/security/Profile'),
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
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myUser', body: {some: 'content'}, meta: {}}, null, sinon.match.func);

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
      kuzzleUser = new User(kuzzle.security, 'user', {some: 'content', profileIds: ['profile']}, {createdAt: '0123456789'});
    });

    it('should serialize with correct attributes', function () {
      var serialized = kuzzleUser.serialize();

      should(serialized._id).be.exactly('user');
      should(serialized.body).match({some: 'content', profileIds: ['profile']});
      should(serialized.meta).match({createdAt: '0123456789'});
    });
  });

  describe('#creationSerialize', function () {
    beforeEach(function () {
      kuzzleUser = new User(kuzzle.security, 'user', {some: 'content', profileIds: ['profile']}, {createdAt: '0123456789'});
      kuzzleUser.setCredentials({some: 'credentials'});
    });

    it('should serialize with correct attributes', function () {
      var serialized = kuzzleUser.creationSerialize();

      should(serialized._id).be.exactly('user');
      should(serialized.body).match({content: {some: 'content', profileIds: ['profile']}, credentials: {some: 'credentials'}, meta: {createdAt: '0123456789'}});
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
    it('should return an empty array if no profile is attached', function (done) {
      kuzzleUser = new User(kuzzle.security, 'foo', {});

      kuzzleUser.getProfiles(function (error, profiles) {
        should(error).be.null();
        should(profiles).be.an.Array().and.be.empty();
        done();
      });
    });

    it('should fetch the attached profiles using the API to build Profile objects', function (done) {
      kuzzleUser = new User(kuzzle.security, 'foo', {profileIds: ['foo', 'bar', 'baz']});
      kuzzle.query.yields(null, {
        result: {
          _id: 'foobar',
          _source: {}
        }
      });

      kuzzleUser.getProfiles(function (error, profiles) {
        should(error).be.null();
        should(profiles).be.an.Array().and.have.lengthOf(3);

        profiles.forEach(function (profile) {
          should(profile).be.instanceof(Profile);
        });

        done();
      });
    });

    it('should not invoke the callback more than once even if multiple errors occur', function (done) {
      var callCount = 0;

      kuzzleUser = new User(kuzzle.security, 'foo', {profileIds: ['foo', 'bar', 'baz']});
      kuzzle.query.yields(new Error('errored'));

      kuzzleUser.getProfiles(function (error, profiles) {
        callCount++;
        should(profiles).be.undefined();
        should(error).be.an.Error().and.have.value('message', 'errored');
        should(callCount).be.eql(1);
        done();
      });
    });

    it('should throw if no callback is provided', function () {
      kuzzleUser = new User(kuzzle.security, 'foo', {});

      should(function () { kuzzleUser.getProfiles(); }).throw('User.getProfiles: a callback argument is required for read queries');
      should(function () { kuzzleUser.getProfiles({}); }).throw('User.getProfiles: a callback argument is required for read queries');
    });
  });
});
