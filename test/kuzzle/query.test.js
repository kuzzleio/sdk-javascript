var
  should = require('should'),
  sinon = require('sinon'),
  rewire = require('rewire'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Kuzzle query management', function () {
  describe('#query', function () {
    var
      networkWrapperRevert,
      queryBody = {body: {some: 'query'}},
      queryArgs = {
        controller: 'controller',
        action: 'action',
        collection: 'collection',
        index: 'index'
      },
      kuzzle;

    beforeEach(function () {
      networkWrapperRevert = Kuzzle.__set__({
        networkWrapper: function(protocol, host, options) {
          return new NetworkWrapperMock(host, options);
        }
      });

      kuzzle = new Kuzzle('foo', {connect: 'manual'});
    });

    afterEach(function() {
      networkWrapperRevert();
    });

    it('should generate a valid request object with no "options" argument and no callback', function () {
      kuzzle.query(queryArgs, queryBody);
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWith({
        action: 'action',
        body: { some: 'query' },
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: { sdkVersion: kuzzle.sdkVersion },
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should generate a valid request object', function () {
      kuzzle.query(queryArgs, queryBody, {foo: 'bar', baz: 'yolo'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWith({
        action: 'action',
        body: { some: 'query' },
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: { sdkVersion: kuzzle.sdkVersion },
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should manage arguments properly if no options are provided', function () {
      var cb = sinon.stub();

      kuzzle.query(queryArgs, queryBody, cb);
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWith({
        action: 'action',
        body: { some: 'query' },
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: { sdkVersion: kuzzle.sdkVersion },
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      }, null, sinon.match(function(f) {return f === cb;}));
    });

    it('should not define optional members if none was provided', function () {
      kuzzle.query({controller: 'foo', action: 'bar'}, queryBody);
      should(kuzzle.network.query).be.calledWithMatch({collection: undefined});
      should(kuzzle.network.query).be.calledWithMatch({index: undefined});
    });

    it('should invoke the callback with an error if no query is provided', function () {
      should(function () { kuzzle.query(queryArgs, sinon.stub()); }).throw(Error);
      should(function () { kuzzle.query(queryArgs, ['foo', 'bar']); }).throw(Error);
      should(function () { kuzzle.query(queryArgs); }).throw(Error);
      should(function () { kuzzle.query(queryArgs, 'foobar'); }).throw(Error);
    });

    it('should handle options "volatile" properly', function () {
      var
        volatile = {
          foo: 'bar',
          baz: ['foo', 'bar', 'qux']
        };

      kuzzle.query(queryArgs, queryBody, {volatile: volatile});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({volatile: volatile});
    });

    it('should copy query local volatile over optional ones', function () {
      var
        volatile = {
          foo: 'bar',
          baz: ['foo', 'bar', 'qux']
        };

      kuzzle.query(queryArgs, { body: { some: 'query'}, volatile: {foo: 'foo'}}, {volatile: volatile});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({volatile: {foo: 'foo', baz: volatile.baz}});
    });

    it('should handle option "refresh" properly', function () {
      kuzzle.query(queryArgs, queryBody, {refresh: 'foo'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({refresh: 'foo'});
    });

    it('should handle option "size" properly', function () {
      kuzzle.query(queryArgs, queryBody, {size: 'foo'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({size: 'foo'});
    });

    it('should handle option "from" properly', function () {
      kuzzle.query(queryArgs, queryBody, {from: 'foo'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({from: 'foo'});
    });

    it('should handle option "scroll" properly', function () {
      kuzzle.query(queryArgs, queryBody, {scroll: 'foo'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({scroll: 'foo'});
    });

    it('should handle option "scrollId" properly', function () {
      kuzzle.query(queryArgs, queryBody, {scrollId: 'foo'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({scrollId: 'foo'});
    });

    it('should add global headers without overwriting any existing query headers', function () {
      kuzzle.headers = { foo: 'bar', bar: 'foo' };
      kuzzle.query(queryArgs, { foo: 'foo', body: {some: 'query'}});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({foo: 'foo', bar: 'foo'});
    });

    it('should not generate a new request ID if one is already defined', function () {
      kuzzle.query(queryArgs, { body: { some: 'query'}, requestId: 'foobar'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({requestId: 'foobar'});
    });

    it('should set jwt except for auth/checkToken', function () {
      kuzzle.jwt = 'fake-token';

      kuzzle.query({controller: 'foo', action: 'bar'}, {});
      kuzzle.query({controller: 'auth', action: 'checkToken'}, {});

      should(kuzzle.network.query).be.calledTwice();
      should(kuzzle.network.query.firstCall.args[0].jwt).be.exactly('fake-token');
      should(kuzzle.network.query.secondCall.args[0].jwt).be.undefined();
    });
  });
});
