var
  should = require('should'),
  Kuzzle = require('../../../src/kuzzle'),
  Role = require('../../../src/security/kuzzleRole'),
  KuzzleUser = require('../../../src/security/kuzzleUser');

describe('KuzzleUser methods', function () {
  var
    kuzzle,
    kuzzleUser,
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

      cb && cb(error, result);
    };

  describe('#save', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = null;

      result = { result: {_id: 'myUser', _source: {some: 'content', profileIds: ['myProfile']}} };
      kuzzleUser = new KuzzleUser(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'createOrReplaceUser',
        controller: 'security'
      };
    });

    it('should throw an error if the user has not profile parameter', function (done) {
      kuzzleUser = new KuzzleUser(kuzzle.security, result.result._id, {some: 'content'});

      should((function () {
        kuzzleUser.save();
      })).throw(Error);

      done();
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleUser.save(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      error = 'foobar';

      kuzzleUser.save(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#saveRestricted', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = null;

      result = { result: {_id: 'myUser', _source: {some: 'content'}} };
      kuzzleUser = new KuzzleUser(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'createRestrictedUser',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleUser.saveRestricted(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      error = 'foobar';

      kuzzleUser.saveRestricted(function (err, res) {
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

      result = { result: {_id: 'myUser', _index: '%kuzzle', _type: 'users'} };
      kuzzleRole = new Role(kuzzle.security, result.result._id, {indexes : {}});
      expectedQuery = {
        action: 'updateUser',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzleUser.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      error = 'foobar';
      this.timeout(50);

      kuzzleUser.update({'foo': 'bar'}, function (err, res) {
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
        kuzzleUser.update();
      }
      catch (e) {
        should(e).be.instanceOf(Error);
        done();
      }
    });
  });

  describe('#setProfiles', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'myUser', {profileIds: ['profile1']});
    });

    it('should throw an error if the profileIds parameter is null', function (done) {
      should((function () {
        kuzzleUser.setProfiles(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the profileIds parameter is not an array', function (done) {
      should((function () {
        kuzzleUser.setProfiles(1);
      })).throw(Error);

      done();
    });

    it('should throw an error if the profileIds parameter is not an array of strings', function (done) {
      should((function () {
        kuzzleUser.setProfiles([1]);
      })).throw(Error);

      done();
    });

    it('should add the rights profiles IDs in profileIds', function (done) {
      kuzzleUser.setProfiles(['profile2']);
      should(kuzzleUser.content.profileIds[0]).be.exactly('profile2');
      done();
    });
  });


  describe('#addProfile', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'myUser', {profileIds: ['profile1']});
    });

    it('should throw an error if the profileId parameter is null', function (done) {
      should((function () {
        kuzzleUser.addProfile(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the profileId parameter is not a string', function (done) {
      should((function () {
        kuzzleUser.addProfile(42);
      })).throw(Error);

      done();
    });

    it('should  add the profile if it does not already exists in list', function (done) {
      kuzzleUser.addProfile('profile2');

      should(kuzzleUser.content.profileIds).be.eql(['profile1', 'profile2']);
      done();
    });

    it('should not add the profile if it already exists in list', function (done) {
      kuzzleUser.addProfile('profile1');

      should(kuzzleUser.content.profileIds).be.eql(['profile1']);
      done();
    });

    it('should add the profile even if no profileIds are currently set', function (done) {
      delete kuzzleUser.content.profileIds;
      kuzzleUser.addProfile('profile1');

      should(kuzzleUser.content.profileIds).be.eql(['profile1']);
      done();
    });

  });

  describe('#serialize', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'user', {some: 'content', profileIds: ['profile']});
    });

    it('should serialize with correct attributes', function (done) {
      var serialized = kuzzleUser.serialize();

      should(serialized._id).be.exactly('user');
      should(serialized.body).be.match({some: 'content', profileIds: ['profile']});
      done();
    });
  });

  describe('#delete', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = null;

      result = { result: {_id: 'user'} };
      kuzzleUser = new KuzzleUser(kuzzle.security, 'user', {some: 'content', profileIds: ['profile']});
      expectedQuery = {
        action: 'deleteUser',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleUser.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      error = 'foobar';

      kuzzleUser.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#getProfiles', function () {
    it('should return the associated profiles', function () {
      var profileIds = ['profile'];
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'user', {some: 'content', profileIds});
      should(kuzzleUser.getProfiles()).be.eql(profileIds);
    });
  });
});
