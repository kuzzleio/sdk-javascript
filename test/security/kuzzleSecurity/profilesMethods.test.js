var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../../src/Kuzzle'),
  Profile = require('../../../src/security/Profile');

describe('Security profiles methods', function () {
  var
    kuzzle,
    expectedQuery,
    result;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
  });

  describe('#fetchProfile', function () {
    beforeEach(function () {
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
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle with id as roles when hydrate is false', function (done) {
      kuzzle.security.fetchProfile('foobar', function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);

        should(res.content.policies).be.an.Array();
        should(res.content.policies).not.be.empty();

        res.content.policies.forEach(function (policy) {
          should(policy).be.an.Object();
          should(policy.roleId).not.be.empty().and.be.a.String();
          should(policy.controllers).be.undefined();
          should(policy.restrictedTo).not.be.empty().and.be.an.Array();
          should(policy.restrictedTo[0].index).be.equal('foo');
          should(policy.restrictedTo[0].collections).not.be.empty().and.be.an.Array();
          should(policy.restrictedTo[0].collections[0]).be.equal('bar');
        });
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'foobar'}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.fetchProfile('test'); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should throw an error when no id is provided', function () {
      should(function () { kuzzle.security.fetchProfile(null, function () {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.fetchProfile('foobar', function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('error');
    });
  });

  describe('#searchProfiles', function () {
    var content = {policies: [ {roleId: 'myRole'} ]};

    beforeEach(function () {
      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: content} ]}};
      expectedQuery = {
        action: 'searchProfiles',
        controller: 'security'
      };
    });

    it('should send the right search query to kuzzle and return profile', function (done) {
      var
        options = {opt: 'val'},
        filters = {foo: 'bar'};

      this.timeout(50);

      should(kuzzle.security.searchProfiles(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(123);
        should(res.profiles).be.an.Array();
        should(res.profiles).not.be.empty();
        should(res.profiles.length).be.exactly(1);

        res.profiles.forEach(function (item) {
          should(item).be.instanceof(Profile);

          item.content.policies.forEach(function (policy) {
            should(policy).be.an.Object();
            should(policy.roleId).be.a.String();
            should(policy.roleId).be.exactly('myRole');
          });
        });

        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: filters}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.searchProfiles({}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.searchProfiles({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });


  describe('#createProfile', function () {
    var policies = [{roleId: 'myRole'}];
    beforeEach(function () {
      result = { result: {_id: 'foobar', _source: {policies: policies}} };
      expectedQuery = {
        action: 'createProfile',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.createProfile('foobar', policies, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Profile);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {policies: policies}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should send the right query to Kuzzle even without callback', function () {
      kuzzle.security.createProfile('foobar', policies);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {policies: policies}}, undefined, undefined);
    });

    it('should construct a createOrReplaceProfile action if option replaceIfExist is set to true', function () {
      expectedQuery.action = 'createOrReplaceProfile';

      should(kuzzle.security.createProfile('foobar', policies, {replaceIfExist: true}));
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {policies: policies}});
    });

    it('should construct a createProfile action if option replaceIfExist is set to false', function () {
      expectedQuery.action = 'createProfile';

      should(kuzzle.security.createProfile('foobar', policies, {replaceIfExist: false}));
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {policies: policies}});
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.createProfile(null); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.createProfile(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#updateProfile', function () {
    var policies = [{roleId: 'foo'}];

    beforeEach(function () {
      result = {
        result: {
          _id: 'foobar',
          _index: '%kuzzle',
          _type: 'profiles',
          _source: {policies: policies}
        }
      };
      expectedQuery = {
        action: 'updateProfile',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      kuzzle.security.updateProfile('foobar', policies, function (err, res) {
        should(err).be.null();
        should(res).be.instanceOf(Profile);
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {policies: policies}}, null, sinon.match.func);
      kuzzle.query.yield(null, result);
    });

    it('should send the right query to Kuzzle even without callback', function () {
      kuzzle.security.updateProfile('foobar', policies);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {policies: policies}}, undefined, undefined);
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.updateProfile(null); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.updateProfile(result.result._id, policies, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#deleteProfile', function () {
    beforeEach(function () {
      result = { result: {_id: 'foobar'} };
      expectedQuery = {
        action: 'deleteProfile',
        controller: 'security'
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.deleteProfile('foobar', function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar'}, null, sinon.match.func);
      kuzzle.query.yield(null, result);
    });

    it('should send the right delete query to Kuzzle even without callback', function () {
      kuzzle.security.deleteProfile('foobar');
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar'}, undefined, undefined);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.deleteProfile(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#scrollProfiles', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      result = { result: { _scroll_id: 'banana', total: 123, hits: [ {_id: 'foobar', _source: { foo: 'bar'}} ] } };
    });

    it('should throw an error if no scrollId is set', function () {
      should(function () { kuzzle.security.scrollProfiles(); }).throw('Security.scrollProfiles: scrollId is required');
    });

    it('should throw an error if no callback is given', function () {
      should(function () { kuzzle.security.scrollProfiles('scrollId'); }).throw('Security.scrollProfiles: a callback argument is required for read queries');
    });

    it('should parse the given parameters', function (done) {
      var
        queryScrollStub,
        scrollId = 'scrollId',
        options = { scroll: '30s' },
        cb = function () {
          done();
        };

      queryScrollStub = function (args, query, opts, callback) {
        should(args.controller).be.exactly('security');
        should(args.action).be.exactly('scrollProfiles');
        should(query.scroll).be.exactly(options.scroll);
        should(query.scrollId).be.exactly(scrollId);

        callback(null, {
          result: {
            total: 1,
            _scroll_id: 'banana',
            hits: [
              {
                _id: 'foo',
                _source: {bar: 'baz'}
              }
            ]
          }
        });
      };

      kuzzle.query = queryScrollStub;

      kuzzle.security.scrollProfiles(scrollId, options, cb);
    });
  });

  describe('#ProfileFactory', function () {
    it('should return an instance of Profile', function () {
      var role = kuzzle.security.profile('test', {policies: [{roleId:'myRole'}]});
      should(role).instanceof(Profile);
    });

    it('should throw an error if no id is provided', function () {
      should((function () {kuzzle.security.profile(null);})).throw(Error);
    });
  });
});
