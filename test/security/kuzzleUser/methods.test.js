var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleProfile = require('../../../src/security/kuzzleProfile'),
  KuzzleRole = require('../../../src/security/kuzzleRole'),
  KuzzleUser = require('../../../src/security/kuzzleUser');

describe('KuzzleUser methods', function () {
  var
    kuzzle,
    kuzzleUser,
    result,
    expectedQuery,
    error = false,
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
      error = false;

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

  describe('#update', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'myUser', _index: '%kuzzle', _type: 'users'} };
      kuzzleRole = new KuzzleRole(kuzzle.security, result.result._id, {indexes : {}});
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
      catch(error) {
        should(error).be.instanceOf(Error);
        done();
      }
    });
  });

  describe('#setProfile', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'myUser', {profilesIds: ['profile1']});
    });

    it('should throw an error if the profile parameter is null', function (done) {
      should((function () {
        kuzzleUser.setProfile(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the profile parameter is not a string', function (done) {
      should((function () {
        kuzzleUser.setProfile(1);
      })).throw(Error);

      done();
    });

    it('should add the rights profiles IDs in profilesIds', function (done) {
      kuzzleUser.setProfiles(['profile2']);
      should(kuzzleUser.content.profilesIds[0]).be.exactly('profile2');
      done();
    });
  });

  describe('#serialize', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'user', {some: 'content', profilesIds: ['profile']});
    });

    it('should serialize with correct attributes', function (done) {
      var serialized = kuzzleUser.serialize();

      should(serialized._id).be.exactly('user');
      should(serialized.body).be.match({some: 'content', profilesIds: ['profile']});
      done();
    });
  });

  describe('#delete', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'user'} };
      kuzzleUser = new KuzzleUser(kuzzle.security, 'user', {some: 'content', profilesIds: ['profile']});
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
      var profilesIds = ['profile'];
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'user', {some: 'content', profilesIds});
      should(kuzzleUser.getProfiles()).be.eql(profilesIds);
    });
  });
});
