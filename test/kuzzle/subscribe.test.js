var
  should = require('should'),
  sinon = require('sinon'),
  rewire = require('rewire'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = rewire('../../src/Kuzzle'),
  KuzzleDocument = require('../../src/Document'),
  KuzzleRoom = require('../../src/Room');

describe('Kuzzle subscription management', function () {
  var
    cb,
    networkWrapperRevert,
    kuzzle,
    room;

  beforeEach(function () {
    cb = sinon.stub();
    networkWrapperRevert = Kuzzle.__set__({
      networkWrapper: function(protocol, host, options) {
        return new NetworkWrapperMock(host, options);
      }
    });

    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    room = new KuzzleRoom(kuzzle.collection('foo', 'bar'), {equals: {foo: 'bar'}}, {});
    room.notify = sinon.stub();
  });

  afterEach(function() {
    networkWrapperRevert();
  });

  describe('#subscribe', function () {
    it('should generate a valid request object', function () {
      kuzzle.subscribe(room, {}, cb);

      should(kuzzle.network.subscribe).be.calledOnce();
      should(kuzzle.network.subscribe).be.calledWithMatch({
        action: 'subscribe',
        body: {equals: {foo: 'bar'}},
        scope: 'all',
        state: 'done',
        users: 'none',
        collection: 'foo',
        controller: 'realtime',
        index: 'bar',
        volatile: { sdkVersion: kuzzle.sdkVersion },
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      });
    });

    it('should handle options "volatile" properly', function () {
      room.volatile = {
        foo: 'bar',
        baz: ['foo', 'bar', 'qux']
      };

      kuzzle.subscribe(room, {}, cb);

      should(kuzzle.network.subscribe).be.calledOnce();
      should(kuzzle.network.subscribe).be.calledWithMatch({volatile: room.volatile});
    });

    it('should add global headers without overwriting any existing query headers', function () {
      kuzzle.headers = {scope: 'none', foo: 'bar'};
      kuzzle.subscribe(room, {}, cb);

      should(kuzzle.network.subscribe).be.calledOnce();
      should(kuzzle.network.subscribe).be.calledWithMatch({scope: 'all', foo: 'bar'});
    });

    it('should set jwt if present', function () {
      kuzzle.jwt = 'fake-token';
      kuzzle.subscribe(room, {}, cb);

      should(kuzzle.network.subscribe).be.calledOnce();
      should(kuzzle.network.subscribe).be.calledWithMatch({jwt: 'fake-token'});
    });
  });

  describe('#unsubscribe', function () {
    beforeEach(function () {
      room.roomId = 'roomId';
      room.channel = 'channel';
    });

    it('should generate a valid request object', function () {
      kuzzle.unsubscribe(room, {foo: 'bar'}, cb);

      should(kuzzle.network.unsubscribe).be.calledOnce();
      should(kuzzle.network.unsubscribe).be.calledWith(sinon.match({
        action: 'unsubscribe',
        body: {roomId: 'roomId'},
        volatile: { sdkVersion: kuzzle.sdkVersion },
        requestId: sinon.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      }),
      {foo: 'bar'},
      'channel',
      cb);
    });

    it('should handle options "volatile" properly', function () {
      room.volatile = {
        foo: 'bar',
        baz: ['foo', 'bar', 'qux']
      };

      kuzzle.unsubscribe(room, {}, cb);

      should(kuzzle.network.unsubscribe).be.calledOnce();
      should(kuzzle.network.unsubscribe).be.calledWithMatch({volatile: room.volatile});
    });

    it('should add global headers without overwriting any existing query headers', function () {
      kuzzle.headers = {body: {roomId: 'none'}, foo: 'bar'};
      kuzzle.unsubscribe(room, {}, cb);

      should(kuzzle.network.unsubscribe).be.calledOnce();
      should(kuzzle.network.unsubscribe).be.calledWithMatch({body: {roomId: 'roomId'}, foo: 'bar'});
    });

    it('should set jwt if present', function () {
      kuzzle.jwt = 'fake-token';
      kuzzle.unsubscribe(room, {}, cb);

      should(kuzzle.network.unsubscribe).be.calledOnce();
      should(kuzzle.network.unsubscribe).be.calledWithMatch({jwt: 'fake-token'});
    });
  });

  describe('#notificationCB', function () {
    var notificationCB;

    beforeEach(function() {
      kuzzle.subscribe(room, {}, cb);
      should(kuzzle.network.subscribe).be.calledOnce();
      notificationCB = kuzzle.network.subscribe.firstCall.args[2];
    });

    it('should handle document notifications', function () {
      notificationCB({
        controller: 'document',
        type: 'document',
        result: {
          _id: 'id',
          _source: {
            foo: 'bar'
          }
        }
      });

      should(room.notify)
        .be.calledOnce()
        .be.calledWithMatch({
          controller: 'document',
          type: 'document',
          document: {
            id: 'id',
            content: {
              foo: 'bar'
            }
          }
        });
      should(room.notify.firstCall.args[0].document)
        .be.an.instanceOf(KuzzleDocument);
    });

    it('should handle realtime publish notifications', function () {
      notificationCB({
        controller: 'realtime',
        action: 'publish',
        type: 'document',
        result: {
          _source: {
            foo: 'bar'
          }
        }
      });

      should(room.notify)
        .be.calledOnce()
        .be.calledWithMatch({
          controller: 'realtime',
          action: 'publish',
          type: 'document',
          document: {
            id: undefined,
            content: {
              foo: 'bar'
            }
          }
        });
      should(room.notify.firstCall.args[0].document)
        .be.an.instanceOf(KuzzleDocument);
    });

    it('should handle user notifications', function () {
      notificationCB({
        controller: 'realtime',
        result: { count: 3 },
        type: 'user',
        user: 'in'
      });

      should(room.notify)
        .be.calledOnce()
        .be.calledWithMatch({
          result: { count: 3 },
          type: 'user',
          user: 'in',
        });
    });

    it('should fire a "tokenExpired" event when receiving a TokenExpired notification', function () {
      kuzzle.emitEvent = sinon.stub();

      notificationCB({type: 'TokenExpired'});
      should(kuzzle.emitEvent).be.calledOnce();
      should(kuzzle.emitEvent).be.calledWith('tokenExpired');
    });
  });
});
