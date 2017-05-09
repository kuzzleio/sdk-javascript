var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../../src/Kuzzle'),
  Role = require('../../../src/security/Role');

describe('Security roles methods', function () {
  var
    kuzzle,
    expectedQuery,
    result;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
  });

  describe('#fetchRole', function () {
    beforeEach(function () {
      result = { result: {_id: 'foobar', _source: {} }};
      expectedQuery = {
        action: 'getRole',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      kuzzle.security.fetchRole(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Role);
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'foobar'}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.fetchRole('test'); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should throw an error when no id is provided', function () {
      should(function () { kuzzle.security.fetchRole(null, function () {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.fetchRole('foobar', function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('error');
    });
  });

  describe('#searchRoles', function () {
    beforeEach(function () {
      result = { result: { total: 123, hits: [ {_id: 'myRole', _source: {indexes : {}}} ]}};
      expectedQuery = {
        action: 'searchRoles',
        controller: 'security'
      };
    });

    it('should send the right search query to kuzzle', function (done) {
      var
        options = {opt: 'val'},
        filters = { indexes: ['test'] };

      this.timeout(50);

      kuzzle.security.searchRoles(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(123);
        should(res.roles).be.an.Array();
        should(res.roles).not.be.empty();
        should(res.roles.length).be.exactly(1);

        res.roles.forEach(function (item) {
          should(item).be.instanceof(Role);
          should(item.id).be.exactly('myRole');
        });

        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {body: filters}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.searchRoles({indexes: ['test']}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.searchRoles({indexes: ['test']}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#createRole', function () {
    var content = {indexes: {'foo': {}}};
    beforeEach(function () {
      result = { result: {_id: 'myRole', _source: content}};
      expectedQuery = {
        action: 'createRole',
        controller: 'security'
      };
    });

    it('should send the right createRole query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.createRole('myRole', content, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Role);
        done();
      }));
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'myRole', body: content}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should send the right createRole query to Kuzzle even without callback', function () {
      kuzzle.security.createRole('myRole', content);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'myRole', body: content}, undefined, undefined);
    });

    it('should construct a createOrReplaceRole action if option replaceIfExist is set to true', function () {
      expectedQuery.action = 'createOrReplaceRole';

      should(kuzzle.security.createRole('myRole', content, {replaceIfExist: true}));
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'myRole', body: content});
    });

    it('should construct a createRole action if option replaceIfExist is set to false', function () {
      expectedQuery.action = 'createRole';

      should(kuzzle.security.createRole('myRole', content, {replaceIfExist: false}));
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'myRole', body: content});
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.createRole(null); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.createRole(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#updateRole', function () {
    beforeEach(function () {
      result = { result: {_id: 'foobar', _index: '%kuzzle', _type: 'roles'} };
      expectedQuery = {
        action: 'updateRole',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.updateRole('foobar', {'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceOf(Role);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {foo: 'bar'}}, null, sinon.match.func);
      kuzzle.query.yield(null, result);
    });

    it('should send the right query to Kuzzle even without callback', function () {
      kuzzle.security.updateRole('foobar', {'foo': 'bar'});
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: {foo: 'bar'}}, undefined, undefined);
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.updateRole(null); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.updateRole(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#deleteRole', function () {
    beforeEach(function () {
      result = { result: {_id: 'myRole'} };
      expectedQuery = {
        action: 'deleteRole',
        controller: 'security'
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      this.timeout(50);

      should(kuzzle.security.deleteRole('myRole', function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'myRole'}, null, sinon.match.func);
      kuzzle.query.yield(null, result);
    });

    it('should send the right delete query to Kuzzle even without callback', function () {
      kuzzle.security.deleteRole('myRole');
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'myRole'}, undefined, undefined);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      kuzzle.security.deleteRole(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#RoleFactory', function () {
    it('should return an instance of Role', function () {
      var role = kuzzle.security.role('test', {index: {}});
      should(role).instanceof(Role);
    });

    it('should throw an error if no id is provided', function () {
      should((function () {kuzzle.security.role(null);})).throw(Error);
    });
  });
});
