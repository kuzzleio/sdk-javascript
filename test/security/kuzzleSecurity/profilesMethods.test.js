var
  should = require('should'),
  Kuzzle = require('../../../src/kuzzle'),
  Profile = require('../../../src/security/kuzzleProfile');

describe('KuzzleSecurity profiles methods', function () {
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

  describe('#getProfile', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = {
        result: {
          _id: 'foobar',
          _source: {
            policies: [
              {
                roleId: 'role1',
                restrictedTo: [{index: 'foo', collections: ['bar']}],
                allowInternalIndex: false
              }
            ]
          }
        }
      };
      expectedQuery = {
        action: 'getProfile',
        controller: 'security',
        _id: 'foobar'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      should(kuzzle.security.getProfile(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);

        should(res.content.policies).be.an.Array();
        should(res.content.policies).not.be.empty();

        res.content.policies.forEach(function (policy) {
          should(policy).be.an.Object();
          should(policy.roleId).be.a.String();
        });
        done();
      }));
    });

    it('should send the right query to Kuzzle with id as roles when hydrate is false', function (done) {
      should(kuzzle.security.getProfile(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);

        should(res.content.policies).be.an.Array();
        should(res.content.policies).not.be.empty();

        res.content.policies.forEach(function (policy) {
          should(policy.roleId).not.be.empty().and.be.a.String();
          should(policy.controllers).be.undefined();
          should(policy.restrictedTo).not.be.empty().and.be.an.Array();
          should(policy.restrictedTo[0].index).be.equal('foo');
          should(policy.restrictedTo[0].collections).not.be.empty().and.be.an.Array();
          should(policy.restrictedTo[0].collections[0]).be.equal('bar');
        });
        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.getProfile('test'); }).throw(Error);
    });

    it('should throw an error when no id is provided', function () {
      should(function () { kuzzle.security.getProfile(null, function () {}); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'error';
      this.timeout(50);

      kuzzle.security.getProfile('foobar', function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#searchProfiles', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: {policies: [ {roleId: 'myRole'} ]}} ]}};
      expectedQuery = {
        action: 'searchProfiles',
        controller: 'security'
      };
    });

    it('should send the right search query to kuzzle and return profile', function (done) {
      var
        filters = {};

      result = { result: { total: 123, hits: [{_id: 'foobar', _source: {policies : [{roleId: 'myRole'}]}}]} };

      this.timeout(50);
      expectedQuery.body = {};

      should(kuzzle.security.searchProfiles(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.profiles).be.an.Array();
        should(res.profiles).not.be.empty();
        should(res.profiles.length).be.exactly(result.result.hits.length);

        res.profiles.forEach(function (item) {
          should(item).be.instanceof(Profile);

          item.content.policies.forEach(function (policy) {
            should(policy).be.an.Object();
            should(policy.roleId).be.String();
          });
        });

        done();
      }));
    });

    it('should send the right search query non hydrated to kuzzle and return profile', function (done) {
      var
        filters = {};

      result = { result: { total: 123, hits: [{_id: 'foobar', _source: {policies : [{roleId: 'myRole'}]}}]} };

      this.timeout(50);
      expectedQuery.body = {};

      should(kuzzle.security.searchProfiles(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.profiles).be.an.Array();
        should(res.profiles).not.be.empty();
        should(res.profiles.length).be.exactly(result.result.hits.length);

        res.profiles.forEach(function (item) {
          should(item).be.instanceof(Profile);

          item.content.policies.forEach(function (policy) {
            should(policy).be.an.Object();
            should(policy.roleId).be.String();
          });
        });

        done();
      }));
    });

    it('should send the right search query to kuzzle and return profile with roles', function (done) {
      var
        filters = {};

      this.timeout(50);
      expectedQuery.body = filters;

      should(kuzzle.security.searchProfiles(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.profiles).be.an.Array();
        should(res.profiles).not.be.empty();
        should(res.profiles.length).be.exactly(result.result.hits.length);

        res.profiles.forEach(function (item) {
          should(item).be.instanceof(Profile);

          item.content.policies.forEach(function (policy) {
            should(policy).be.an.Object();
            should(policy.roleId).be.String();
          });
        });

        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      var
        filters = {};

      should(function () { kuzzle.security.searchProfiles(filters); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      var
        filters = {};

      expectedQuery.body = filters;

      error = 'foobar';
      this.timeout(50);

      kuzzle.security.searchProfiles(filters, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });


  describe('#createProfile', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _source: {policies: [{roleId: 'myRole'}]}} };
      expectedQuery = {
        action: 'createProfile',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzle.security.createProfile(result.result._id, result.result._source, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      kuzzle.security.createProfile(result.result._id, result.result._source);
      done();
    });

    it('should construct a createOrReplaceProfile action if option replaceIfExist is set to true', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createOrReplaceProfile';

      should(kuzzle.security.createProfile(result.result._id, result.result._source, {replaceIfExist: true}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);
        done();
      }));
    });

    it('should construct a createProfile action if option replaceIfExist is set to true', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createProfile';

      should(kuzzle.security.createProfile(result.result._id, result.result._source, {replaceIfExist: false}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);
        done();
      }));
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.createProfile(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.createProfile(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#updateProfile', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = {
        result: {
          _id: 'foobar',
          _index: '%kuzzle',
          _type: 'profiles',
          _source: {
            policies: [{roleId: 'foo'}],
            foo: 'bar'
          }
        }
      };
      expectedQuery = {
        action: 'updateProfile',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzle.security.updateProfile(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceOf(Profile);
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function () {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      kuzzle.security.updateProfile(result.result._id, {'foo': 'bar'});
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.updateProfile(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.updateProfile(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#deleteProfile', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar'} };
      expectedQuery = {
        action: 'deleteProfile',
        controller: 'security',
        _id: result.result._id
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      should(kuzzle.security.deleteProfile(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should send the right delete query to Kuzzle even without callback', function (done) {
      kuzzle.security.deleteProfile(result.result._id);
      done();
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.deleteProfile(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#ProfileFactory', function () {
    it('should return an instance of Profile', function (done) {
      var role = kuzzle.security.profileFactory('test', {policies: [{roleId:'myRole'}]});
      should(role).instanceof(Profile);
      done();
    });

    it('should throw an error if no id is provided', function (done) {
      should((function () {kuzzle.security.profileFactory(null);})).throw(Error);
      done();
    });
  });
});
