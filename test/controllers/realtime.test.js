const
  AuthController = require('../../src/controllers/Auth'),
  RealtimeController = require('../../src/controllers/Realtime'),
  generateJwt = require('../mocks/generateJwt.mock'),
  mockrequire = require('mock-require'),
  sinon = require('sinon'),
  should = require('should'),
  uuidv4 = require('../../src/utils/uuidv4');

describe('Realtime Controller', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      addListener: sinon.stub(),
      query: sinon.stub().resolves(),
      emit: sinon.stub()
    };
    kuzzle.realtime = new RealtimeController(kuzzle);
    kuzzle.auth = new AuthController(kuzzle);
    kuzzle.auth.authenticationToken = generateJwt();
  });

  after(() => {
    mockrequire.stopAll();
  });

  describe('#count', () => {
    it('should call realtime/count query with the roomId and return a Promise which resolves a number', () => {
      kuzzle.query.resolves({result: {roomId: 'roomId', count: 1234}});

      return kuzzle.realtime.count('roomId', options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'realtime',
              action: 'count',
              body: {roomId: 'roomId'}
            }, options);

          should(res).be.a.Number().and.be.equal(1234);
        });
    });
  });

  describe('#publish', () => {
    it('should call realtime/publish query with the index, collection and body and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({result: {published: true}});

      return kuzzle.realtime.publish('index', 'collection', {foo: 'bar'}, options)
        .then(published => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'realtime',
              action: 'publish',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'}
            }, options);

          should(published).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('#subscribe', () => {
    const
      roomId = uuidv4(),
      subscribeResponse = {
        result: {roomId, channel: 'notification-channel'}
      };

    let room;

    beforeEach(() => {
      room = null;

      mockrequire(
        '../../../src/core/realtime/Room',
        function (controller, index, collection, body, callback, opts = {}) {
          room = {
            controller,
            index,
            collection,
            body,
            callback,
            kuzzle: controller.kuzzle,
            options: opts,
            id: roomId,
            subscribe: sinon.stub().resolves(subscribeResponse)
          };

          return room;
        });

      const MockRealtimeController =
        mockrequire.reRequire('../../src/controllers/Realtime');
      kuzzle.realtime = new MockRealtimeController(kuzzle);
    });

    it('should create a Room object with the propataged arguments and bind subscribe() method to it', () => {
      const body = {foo: 'bar'};
      const cb = sinon.stub();
      kuzzle.query.resolves(subscribeResponse);
      kuzzle.protocol = {
        on: sinon.stub()
      };


      return kuzzle.realtime.subscribe('index', 'collection', body, cb, options)
        .then(res => {
          should(room.kuzzle).be.equal(kuzzle);
          should(room.index).be.equal('index');
          should(room.collection).be.equal('collection');
          should(room.body).be.equal(body);
          should(room.callback).be.equal(cb);
          should(room.options).be.equal(options);
          should(room.subscribe).be.calledOnce();
          should(res).be.equal(subscribeResponse.result.roomId);
        });
    });

    it('should store the room subsciption locally', () => {
      const
        body = {foo: 'bar'},
        cb = sinon.stub();

      kuzzle.realtime.subscriptions = {};
      return kuzzle.realtime.subscribe('index', 'collection', body, cb, options)
        .then(() => {
          const subscriptions = kuzzle.realtime.subscriptions[roomId];

          should(subscriptions).be.an.Array();
          should(subscriptions.length).be.exactly(1);
          should(subscriptions[0]).be.exactly(room);
          return kuzzle.realtime.subscribe('index', 'collection', body, cb, options);
        }).then(() => {
          const subscriptions = kuzzle.realtime.subscriptions[roomId];

          should(subscriptions).be.an.Array();
          should(subscriptions.length).be.exactly(2);
          should(subscriptions[1]).be.exactly(room);
        });
    });
  });

  describe('#unsubscribe', () => {
    const
      roomId = uuidv4(),
      room1 = {
        removeListeners: sinon.stub()
      },
      room2 = {
        removeListeners: sinon.stub()
      },
      room3 = {
        removeListeners: sinon.stub()
      };

    beforeEach(() => {
      room1.removeListeners.reset();
      room2.removeListeners.reset();

      kuzzle.realtime.subscriptions[roomId] = [room1, room2];
      kuzzle.realtime.subscriptions.foo = [room3];

      kuzzle.query.resolves({result: roomId});
    });

    it('should reject the promise if the room is not found', () => {
      return kuzzle.realtime.unsubscribe('bar')
        .then(() => {
          throw new Error('Expected Function unsubscribe() to reject');
        })
        .catch(err => {
          should(err.message).be.equal('not subscribed to bar');
        });
    });

    it('should call removeListeners for each room', () => {
      return kuzzle.realtime.unsubscribe(roomId)
        .then(() => {
          should(room1.removeListeners).be.calledOnce();
          should(room2.removeListeners).be.calledOnce();
          should(room3.removeListeners).not.be.called();
        });
    });

    it('should delete rooms from local storage', () => {
      return kuzzle.realtime.unsubscribe(roomId)
        .then(() => {
          should(kuzzle.realtime.subscriptions[roomId]).be.undefined();

          // Check we do not remove other registered rooms:
          should(kuzzle.realtime.subscriptions.foo).be.an.Array();
          should(kuzzle.realtime.subscriptions.foo.length).be.equal(1);
          should(kuzzle.realtime.subscriptions.foo[0]).be.equal(room3);
        });
    });

    it('should call realtime/unsubscribe query with the roomId and return a Promise which resolves the roomId', () => {
      return kuzzle.realtime.unsubscribe(roomId, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'realtime',
              action: 'unsubscribe',
              body: {roomId}
            }, options);

          should(res).be.equal(roomId);
        });
    });
  });

  describe('#disconnected', () => {
    it('should disable current subscriptions', () => {
      const roomA = {
        autoResubscribe: true,
        removeListeners: sinon.stub()
      };
      const roomB = {
        autoResubscribe: false,
        removeListeners: sinon.stub()
      };
      const roomC = {
        autoResubscribe: false,
        removeListeners: sinon.stub()
      };

      kuzzle.realtime.subscriptions = {
        foo: [roomA, roomB],
        bar: [roomC]
      };

      kuzzle.realtime.disconnected();

      should(kuzzle.realtime.subscriptions).be.empty();
      should(kuzzle.realtime.subscriptionsOff).eql({
        foo: [roomA]
      });
      for (const room of [roomA, roomB, roomC]) {
        should(room.removeListeners).be.calledOnce();
      }
    });
  });

  describe('#reconnected', () => {
    it('should resubmit pending subcriptions', () => {
      const roomA = { subscribe: sinon.stub().resolves() };
      const roomB = { subscribe: sinon.stub().resolves() };
      const roomC = { subscribe: sinon.stub().resolves() };

      kuzzle.realtime.subscriptionsOff = {
        foo: [roomA, roomB],
        bar: [roomC]
      };

      kuzzle.realtime.reconnected();

      should(kuzzle.realtime.subscriptionsOff).be.empty();
      should(kuzzle.realtime.subscriptions).eql({
        foo: [roomA, roomB],
        bar: [roomC]
      });

      for (const room of [roomA, roomB, roomC]) {
        should(room.subscribe).be.calledOnce();
      }

    });
  });

  describe('#tokenExpired', () => {
    it('should clear all subscriptions and emit a "tokenExpired" event', () => {
      const stub = sinon.stub();

      kuzzle.jwt = 'foobar';

      for (let i = 0; i < 10; i++) {
        kuzzle.realtime.subscriptions[uuidv4()] = [{removeListeners: stub}];
      }

      kuzzle.realtime.tokenExpired();

      should(kuzzle.realtime.subscriptions).be.empty();
      should(stub.callCount).be.eql(10);
    });
  });

});
