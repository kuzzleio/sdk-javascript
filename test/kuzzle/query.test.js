const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  generateJwt = require('../mocks/generateJwt.mock'),
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
      const protocol = new ProtocolMock('somewhere');

      kuzzle = new Kuzzle(protocol);
      kuzzle.protocol.query.resolves(response);
    });

    it('should generate a valid request object with no "options" argument and no callback', () => {
      kuzzle.query(query);
      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWith({
        action: 'action',
        body: {some: 'query'},
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: { sdkInstanceId: kuzzle.protocol.id, sdkName: kuzzle.sdkName},
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should generate a valid request object', () => {
      kuzzle.query(query, {foo: 'bar', baz: 'yolo'});
      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWith({
        action: 'action',
        body: {some: 'query'},
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: {sdkInstanceId: kuzzle.protocol.id, sdkName: kuzzle.sdkName},
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should return the good response from Kuzzle', () => {
      return kuzzle.query(query, {foo: 'bar', baz: 'yolo'})
        .then(res => should(res).be.equal(response));
    });

    it('should manage arguments properly if no options are provided', () => {
      kuzzle.query(query);
      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWith({
        action: 'action',
        body: {some: 'query'},
        collection: 'collection',
        controller: 'controller',
        index: 'index',
        volatile: {sdkInstanceId: kuzzle.protocol.id, sdkName: kuzzle.sdkName},
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should not define optional members if none was provided', () => {
      kuzzle.query({controller: 'foo', action: 'bar'});
      should(kuzzle.protocol.query).be.calledWithMatch({collection: undefined});
      should(kuzzle.protocol.query).be.calledWithMatch({index: undefined});
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
      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWithMatch({volatile: kuzzle.volatile});
    });

    it('should copy request local volatile over kuzzle object ones', () => {
      const volatile = {
        foo: 'bar',
        baz: ['foo', 'bar', 'qux']
      };

      kuzzle.volatile = volatile;

      kuzzle.query({body: {some: 'query'}, volatile: {foo: 'foo'}});
      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWithMatch({volatile: {foo: 'foo', baz: volatile.baz}});
    });

    it('should allow to override "sdkInstanceId" and "sdkName" volatile data', () => {
      kuzzle.protocol.id = 'kuz-sdk-instance-id';
      kuzzle.sdkName = 'kuz-sdk-version';

      const volatile = {
        sdkInstanceId: 'req-sdk-instance-id',
        sdkName: 'req-sdk-version'
      };
      kuzzle.query({body: {some: 'query'}, volatile});

      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWithMatch({
        volatile: {
          sdkInstanceId: 'req-sdk-instance-id',
          sdkName: 'req-sdk-version'
        }
      });
    });

    it('should handle option "refresh" properly', () => {
      kuzzle.query({refresh: 'wait_for'});
      should(kuzzle.protocol.query).be.calledWithMatch({refresh: 'wait_for'});

      kuzzle.query({refresh: false});
      should(kuzzle.protocol.query).be.calledWithMatch({refresh: false});
    });

    it('should not generate a new request ID if one is already defined', () => {
      kuzzle.query({body: {some: 'query'}, requestId: 'foobar'});
      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWithMatch({requestId: 'foobar'});
    });

    it('should set jwt except for auth/checkToken', () => {
      const jwt = generateJwt();
      kuzzle.jwt = jwt;

      kuzzle.query({controller: 'foo', action: 'bar'}, {});
      kuzzle.query({controller: 'auth', action: 'checkToken'}, {});

      should(kuzzle.protocol.query).be.calledTwice();
      should(kuzzle.protocol.query.firstCall.args[0].jwt).be.exactly(jwt);
      should(kuzzle.protocol.query.secondCall.args[0].jwt).be.undefined();
    });

    it('should queue the request if queing and queuable', () => {
      kuzzle.queuing = true;

      const eventStub = sinon.stub();
      kuzzle.addListener('offlineQueuePush', eventStub);

      const request = {controller: 'foo', action: 'bar'};

      kuzzle.query(request, {});

      should(kuzzle.protocol.query).not.be.called();
      should(eventStub)
        .be.calledOnce()
        .be.calledWith({request});

      should(kuzzle._offlineQueue.length).be.eql(1);
    });

    it('should not queue if the request is not queuable', () => {
      kuzzle.queuing = true;

      const eventStub = sinon.stub();
      kuzzle.addListener('discarded', eventStub);

      const request = {
        controller: 'foo',
        action: 'bar'
      };

      return kuzzle.query(request, {queuable: false})
        .then(() => {
          throw new Error('no error');
        })
        .catch(() => {
          should(kuzzle.protocol.query)
            .not.be.called();
          should(kuzzle._offlineQueue.length).eql(0);
          should(eventStub)
            .be.calledOnce()
            .be.calledWith({request});
        });
    });

    it('should not queue if queueFilter is set and says so', () => {
      kuzzle.queuing = true;
      kuzzle.queueFilter = () => false;

      return kuzzle.query({controller: 'foo', action: 'bar'}, {queuable: true})
        .then(() => {
          throw new Error('no error');
        })
        .catch(() => {
          should(kuzzle.protocol.query)
            .be.not.be.called();
        });

    });
  });
});
