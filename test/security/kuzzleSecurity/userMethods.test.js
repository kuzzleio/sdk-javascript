var
  should = require('should'),
  Kuzzle = require('../../../src/Kuzzle'),
  User = require('../../../src/security/User');

describe('Security user methods', function () {
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

  describe('#fetchUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _source: {profileIds: ['profile']}}};
      expectedQuery = {
        action: 'getUser',
        controller: 'security',
        _id: 'foobar'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      should(kuzzle.security.fetchUser(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);

        should(res.content.profileIds).be.an.Array();
        should(res.content.profileIds[0]).be.a.String();

        done();
      }));
    });

    it('should send the right query to Kuzzle with id as profile', function (done) {
      should(kuzzle.security.fetchUser(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);

        should(res.content.profileIds).be.an.Array();
        should(res.content.profileIds[0]).be.a.String();

        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.fetchUser('test'); }).throw(Error);
    });

    it('should throw an error when no id is provided', function () {
      should(function () { kuzzle.security.fetchUser(null, function () {}); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'error';
      this.timeout(50);

      kuzzle.security.fetchUser('foobar', function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#searchUsers', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: {profileIds : ['myProfile']}} ]}};
      expectedQuery = {
        action: 'searchUsers',
        controller: 'security'
      };
    });

    it('should send the right search query to kuzzle and return user with string', function (done) {
      var
        filters = {};

      this.timeout(50);
      expectedQuery.body = {};

      should(kuzzle.security.searchUsers(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.users).be.an.Array();
        should(res.users).not.be.empty();
        should(res.users.length).be.exactly(result.result.hits.length);

        res.users.forEach(function (item) {
          should(item).be.instanceof(User);

          should(item.content.profileIds).be.an.Array();
          should(item.content.profileIds[0]).be.a.String();
        });

        done();
      }));
    });

    it('should send the right search query to kuzzle and return user', function (done) {
      var
        filters = {};

      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: {
        profileIds: ['myProfile']
      }}]}};

      this.timeout(50);
      expectedQuery.body = filters;

      should(kuzzle.security.searchUsers(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.users).be.an.Array();
        should(res.users).not.be.empty();
        should(res.users.length).be.exactly(result.result.hits.length);

        res.users.forEach(function (item) {
          should(item).be.instanceof(User);

          should(item.content.profileIds).be.an.Array();
          should(item.content.profileIds[0]).be.a.String();
        });

        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      var
        filters = {};

      should(function () { kuzzle.security.searchUsers(filters); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      var
        filters = {};

      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: {
        profileIds: ['myProfile']
      }}]}};

      expectedQuery.body = filters;
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.searchUsers(filters, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#createUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _source: {profileIds: ['myProfile']}} };
      expectedQuery = {
        action: 'createUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzle.security.createUser(result.result._id, result.result._source, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      kuzzle.security.createUser(result.result._id, result.result._source);
      done();
    });

    it('should construct a createOrReplaceUser action if option replaceIfExist is set to true', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createOrReplaceUser';

      should(kuzzle.security.createUser(result.result._id, result.result._source, {replaceIfExist: true}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        done();
      }));
    });

    it('should construct a createUser action if option replaceIfExist is set to false', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createUser';

      should(kuzzle.security.createUser(result.result._id, result.result._source, {replaceIfExist: false}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        done();
      }));
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.createUser(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.createUser(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#createRestrictedUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = {result: {_id: 'foobar', _source: {some: 'body'}}};
      expectedQuery = {
        action: 'createRestrictedUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzle.security.createRestrictedUser(result.result._id, result.result._source, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      kuzzle.security.createRestrictedUser(result.result._id, result.result._source);
      done();
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.createRestrictedUser(null); }).throw(Error);
    });

    it('should throw an error if profileIds is provided', function () {
      should(function () { kuzzle.security.createRestrictedUser(result.result._id, {profileIds: ['someProfile']}); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.createRestrictedUser(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#replaceUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _index: '%kuzzle', _type: 'users', _source: {profileIds: ['foobar']} } };
      expectedQuery = {
        action: 'replaceUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function(done) {
      expectedQuery._id = 'foobar';
      expectedQuery.body = {'profileIds': ['foobar']};

      should(kuzzle.security.replaceUser(expectedQuery._id, expectedQuery.body, function (err, res) {
        should(err).be.null();
        should(res).be.instanceOf(User);
        should(res).containDeep(new User(kuzzle.security, result.result._id, result.result._source));
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      kuzzle.security.replaceUser(result.result._id, {'foo': 'bar'});
      done();
    });

    it('should throw an error if no id is provided', function () {
      should(function () { kuzzle.security.replaceUser(null, {'foo': 'bar'}); }).throw(Error);
    });
  });

  describe('#updateUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _index: '%kuzzle', _type: 'users', _source: {profileIds: ['foobar']} } };
      expectedQuery = {
        action: 'updateUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzle.security.updateUser(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.an.instanceOf(User);
        should(res).containDeep(new User(kuzzle.security, result.result._id, result.result._source));
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      kuzzle.security.updateUser(result.result._id, {'foo': 'bar'});
      done();
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.updateUser(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.updateUser(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#deleteUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar'} };
      expectedQuery = {
        action: 'deleteUser',
        controller: 'security',
        _id: result.result._id
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      should(kuzzle.security.deleteUser(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should send the right delete query to Kuzzle even without callback', function (done) {
      kuzzle.security.deleteUser(result.result._id);
      done();
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.deleteUser(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#UserFactory', function () {
    it('should return an instance of Profile', function (done) {
      var user = kuzzle.security.user('test', {profileIds: ['myProfile']});
      should(user).instanceof(User);
      done();
    });

    it('should throw an error if no id is provided', function (done) {
      should((function () {kuzzle.security.user(null);})).throw(Error);
      done();
    });
  });
});
