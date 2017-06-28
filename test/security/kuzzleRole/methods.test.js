var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../../src/Kuzzle'),
  Role = require('../../../src/security/Role');

describe('Role methods', function () {
  var
    kuzzle,
    role,
    result,
    expectedQuery;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
  });

  describe('#save', function () {
    beforeEach(function () {
      result = { result: {_id: 'myRole', _source: {indexes : {}}} };
      role = new Role(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'createOrReplaceRole',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      should(role.save(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Role);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myRole', body: {indexes : {}}, meta: {}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      role.save(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });

  describe('#update', function () {
    beforeEach(function () {
      result = { result: {_id: 'myRole', _index: '%kuzzle', _type: 'roles'} };
      role = new Role(kuzzle.security, 'myRole', {indexes : {}});
      expectedQuery = {
        action: 'updateRole',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      role.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Role);
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myRole', body: {foo: 'bar'}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      role.update({'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });

    it('should raise an error if no content given', function () {
      should(function() {role.update();}).throw(Error);
      should(kuzzle.query).not.be.called();
    });
  });

  describe('#serialize', function () {
    beforeEach(function () {
      role = new Role(kuzzle.security, 'myRole', {indexes : {}}, {createdAt: '123456789'});
    });

    it('should serialize with correct attributes', function () {
      var serialized = role.serialize();

      should(serialized._id).be.exactly('myRole');
      should(serialized.body).match({indexes : {}});
      should(serialized.meta).match({createdAt: '123456789'});
    });
  });

  describe('#delete', function () {
    beforeEach(function () {
      result = { result: {_id: 'myRole'} };
      role = new Role(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'deleteRole',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      this.timeout(50);

      role.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly('myRole');
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, {_id: 'myRole'}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';

      role.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });

      kuzzle.query.yield('foobar');
    });
  });
});
