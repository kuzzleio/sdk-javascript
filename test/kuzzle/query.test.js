const
  should = require('should'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle query management', () => {
  describe('#query', () => {
    const
      query = {
        controller: 'controller',
        action: 'action',
        collection: 'collection',
        index: 'index',
        body: {some: 'query'}
      },
      response = {
        result: {foo: 'bar'}
      };

    let kuzzle;

    beforeEach(() => {
      const network = new NetworkWrapperMock({host: 'somewhere'});

      kuzzle = new Kuzzle(network);
      kuzzle.network.query.resolves(response);
    });

    it('should generate a valid request object with no "options" argument and no callback', () => {
      kuzzle.query(query);
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWith({
        action: 'action',
        body: {some: 'query'},
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: {sdkInstanceId: kuzzle.network.id, sdkVersion: kuzzle.sdkVersion},
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should generate a valid request object', () => {
      kuzzle.query(query, {foo: 'bar', baz: 'yolo'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWith({
        action: 'action',
        body: {some: 'query'},
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: {sdkInstanceId: kuzzle.network.id, sdkVersion: kuzzle.sdkVersion},
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should return the good response from Kuzzle', () => {
      return kuzzle.query(query, {foo: 'bar', baz: 'yolo'})
        .then(res => should(res).be.equal(response));
    });

    it('should manage arguments properly if no options are provided', () => {
      kuzzle.query(query);
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWith({
        action: 'action',
        body: {some: 'query'},
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: {sdkInstanceId: kuzzle.network.id, sdkVersion: kuzzle.sdkVersion},
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should not define optional members if none was provided', () => {
      kuzzle.query({controller: 'foo', action: 'bar'});
      should(kuzzle.network.query).be.calledWithMatch({collection: undefined});
      should(kuzzle.network.query).be.calledWithMatch({index: undefined});
    });

    it('should throw an error if the "request" argument if maformed', () => {
      should(function () {
        kuzzle.query('foobar');
      }).throw('Kuzzle.query: Invalid request: "foobar"');
      should(function () {
        kuzzle.query(['foo', 'bar']);
      }).throw('Kuzzle.query: Invalid request: ["foo","bar"]');
    });

    it('should throw an error if the "request.volatile" argument if maformed', () => {
      should(function () {
        kuzzle.query({volatile: 'foobar'});
      }).throw('Kuzzle.query: Invalid volatile argument received: "foobar"');
      should(function () {
        kuzzle.query({volatile: ['foo', 'bar']});
      }).throw('Kuzzle.query: Invalid volatile argument received: ["foo","bar"]');
    });

    it('should throw an error if the "options" argument if maformed', () => {
      should(function () {
        kuzzle.query({}, 'foobar');
      }).throw('Kuzzle.query: Invalid "options" argument: "foobar"');
      should(function () {
        kuzzle.query({}, ['foo', 'bar']);
      }).throw('Kuzzle.query: Invalid "options" argument: ["foo","bar"]');
    });

    it('should handle kuzzle "volatile" properly', () => {
      const volatile = {
        foo: 'bar',
        baz: ['foo', 'bar', 'qux']
      };

      kuzzle.volatile = volatile;
      kuzzle.query();
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({volatile: kuzzle.volatile});
    });

    it('should copy request local volatile over kuzzle object ones', () => {
      const volatile = {
        foo: 'bar',
        baz: ['foo', 'bar', 'qux']
      };

      kuzzle.volatile = volatile;

      kuzzle.query({body: {some: 'query'}, volatile: {foo: 'foo'}});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({volatile: {foo: 'foo', baz: volatile.baz}});
    });

    it('should not override "sdkInstanceId" and "sdkVersion" volatile data', () => {
      kuzzle.network.id = 'kuz-sdk-instance-id';
      kuzzle.sdkVersion = 'kuz-sdk-version';

      const volatile = {
        sdkInstanceId: 'req-sdk-instance-id',
        sdkVersion: 'req-sdk-version'
      };
      kuzzle.query({body: {some: 'query'}, volatile});

      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({
        volatile: {
          sdkInstanceId: 'kuz-sdk-instance-id',
          sdkVersion: 'kuz-sdk-version'
        }
      });
    });

    it('should handle option "refresh" properly', () => {
      kuzzle.query({refresh: 'foo'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({refresh: 'wait_for'});
    });

    it('should not generate a new request ID if one is already defined', () => {
      kuzzle.query({body: {some: 'query'}, requestId: 'foobar'});
      should(kuzzle.network.query).be.calledOnce();
      should(kuzzle.network.query).be.calledWithMatch({requestId: 'foobar'});
    });

    it('should set jwt except for auth/checkToken', () => {
      kuzzle.jwt = 'fake-token';

      kuzzle.query({controller: 'foo', action: 'bar'}, {});
      kuzzle.query({controller: 'auth', action: 'checkToken'}, {});

      should(kuzzle.network.query).be.calledTwice();
      should(kuzzle.network.query.firstCall.args[0].jwt).be.exactly('fake-token');
      should(kuzzle.network.query.secondCall.args[0].jwt).be.undefined();
    });
  });
});
