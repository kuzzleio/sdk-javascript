var
  should = require('should'),
  Kuzzle = require('../../../src/Kuzzle'),
  User = require('../../../src/security/User'),
  sinon = require('sinon');

describe('Security user methods', function () {
  var
    kuzzle,
    expectedQuery,
    result;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
  });

  describe('#fetchUser', function () {
    beforeEach(function () {
      result = { result: {_id: 'foobar', _source: {profileIds: ['profile']}}};
      expectedQuery = {
        action: 'getUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      kuzzle.security.fetchUser('foobar', function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);

        should(res.content.profileIds).be.an.Array();
        should(res.content.profileIds[0]).be.a.String();
        should(res.content.profileIds[0]).be.exactly('profile');

        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'foobar'}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.fetchUser('test'); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should throw an error when no id is provided', function () {
      should(function () { kuzzle.security.fetchUser(null, function () {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.fetchUser('foobar', function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('error');
    });
  });

  describe('#searchUsers', function () {
    beforeEach(function () {
      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: {profileIds : ['myProfile']}} ]}};
      expectedQuery = {
        action: 'searchUsers',
        controller: 'security'
      };
    });

    it('should send the right search query to kuzzle and return user with string', function (done) {
      var
        options = {opt: 'val'},
        filters = {foo: 'bar'};

      this.timeout(50);

      should(kuzzle.security.searchUsers(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(123);
        should(res.users).be.an.Array();
        should(res.users).not.be.empty();
        should(res.users.length).be.exactly(1);

        res.users.forEach(function (item) {
          should(item).be.instanceof(User);

          should(item.id).be.exactly('foobar');

          should(item.content.profileIds).be.an.Array();
          should(item.content.profileIds[0]).be.a.String();
          should(item.content.profileIds[0]).be.exactly('myProfile');
        });

        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: filters}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.searchUsers({}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.searchUsers({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#createUser', function () {
    var content = {profileIds: ['myProfile']};

    beforeEach(function () {
      kuzzle.security.fetchUser = sinon.stub();
      result = { result: {_id: 'foobar', _source: content}};
      expectedQuery = {
        action: 'createUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.createUser('foobar', {content: content, credentials: {some: 'credentials'}}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        done();
      }));
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {content: content, credentials: {some: 'credentials'}}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should send the right query to Kuzzle even without callback', function () {
      kuzzle.security.createUser('foobar', content);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: content}, null, undefined);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.createUser(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#createRestrictedUser', function () {
    var content = {some: 'body'};

    beforeEach(function () {
      result = {result: {_id: 'foobar', _source: content}};
      expectedQuery = {
        action: 'createRestrictedUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      kuzzle.security.createRestrictedUser('foobar', content, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(User);
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: content}, null, sinon.match.func);
      kuzzle.query.yield(null, result);
    });

    it('should send the right query to Kuzzle even without callback', function () {
      kuzzle.security.createRestrictedUser('foobar', content);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: content}, null, undefined);
    });

    it('should throw an error if profileIds is provided', function () {
      should(function () { kuzzle.security.createRestrictedUser('foobar', {profileIds: ['someProfile']}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.createRestrictedUser(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#replaceUser', function () {
    var content = {profileIds: ['foobar']};

    beforeEach(function () {
      result = { result: {_id: 'foobar', _index: '%kuzzle', _type: 'users', _source: content}};
      expectedQuery = {
        action: 'replaceUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function(done) {
      kuzzle.security.replaceUser('foobar', content, function (err, res) {
        should(err).be.null();
        should(res).be.instanceOf(User);
        should(res).containDeep(new User(kuzzle.security, result.result._id, result.result._source));
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: content}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should send the right query to Kuzzle even without callback', function () {
      kuzzle.security.replaceUser('foobar', {'foo': 'bar'});
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {foo: 'bar'}}, undefined, undefined);
    });

    it('should throw an error if no id is provided', function () {
      should(function () { kuzzle.security.replaceUser(null, {'foo': 'bar'}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });
  });

  describe('#updateUser', function () {
    var content = {profileIds: ['foobar']};

    beforeEach(function () {
      result = { result: {_id: 'foobar', _index: '%kuzzle', _type: 'users', _source: content}};
      expectedQuery = {
        action: 'updateUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.updateUser('foobar', content, function (err, res) {
        should(err).be.null();
        should(res).be.an.instanceOf(User);
        should(res).containDeep(new User(kuzzle.security, 'foobar', content));
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: content}, null, sinon.match.func);
      kuzzle.query.yield(null, result);
    });

    it('should send the right query to Kuzzle even without callback', function () {
      kuzzle.security.updateUser('foobar', {'foo': 'bar'});
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {foo: 'bar'}}, undefined, undefined);
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.updateUser(null); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.updateUser(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#deleteUser', function () {
    beforeEach(function () {
      result = { result: {_id: 'foobar'} };
      expectedQuery = {
        action: 'deleteUser',
        controller: 'security'
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.deleteUser('foobar', function (err, res) {
        should(err).be.null();
        should(res).be.exactly('foobar');
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar'}, null, sinon.match.func);
      kuzzle.query.yield(null, result);
    });

    it('should send the right delete query to Kuzzle even without callback', function () {
      kuzzle.security.deleteUser('foobar');
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar'}, undefined, undefined);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.deleteUser(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#scrollUsers', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      result = { result: { _scroll_id: 'banana', total: 123, hits: [ {_id: 'foobar', _source: { foo: 'bar'}} ] } };
    });

    it('should throw an error if no scrollId is set', function () {
      should(function () { kuzzle.security.scrollUsers(); }).throw('Security.scrollUsers: scrollId is required');
    });

    it('should throw an error if no callback is given', function () {
      should(function () { kuzzle.security.scrollUsers('scrollId'); }).throw('Security.scrollUsers: a callback argument is required for read queries');
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
        should(args.action).be.exactly('scrollUsers');
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

      kuzzle.security.scrollUsers(scrollId, options, cb);
    });
  });

  describe('#UserFactory', function () {
    it('should return an instance of User', function () {
      var user = kuzzle.security.user('test', {profileIds: ['myProfile']});
      should(user).instanceof(User);
      should(user.content.profileIds).be.an.Array();
      should(user.content.profileIds.length).be.exactly(1);
      should(user.content.profileIds[0]).be.exactly('myProfile');
    });

    it('should throw an error if no id is provided', function () {
      should((function () {kuzzle.security.user(null);})).throw(Error);
    });
  });
});
