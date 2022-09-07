const sinon = require('sinon');
const should = require('should');

const Room = require('../../src/core/Room');
const { KuzzleEventEmitter } = require('../../src/core/KuzzleEventEmitter');

describe('Room', () => {
  const eventEmitter = new KuzzleEventEmitter();
  const options = {opt: 'in'};

  let controller;

  beforeEach(() => {
    controller = {
      kuzzle: {
        query: sinon.stub().resolves(),
        addListener: (evt, listener) => {
          eventEmitter.addListener(evt, listener);
        },
        removeListener: (evt, listener) => {
          eventEmitter.removeListener(evt, listener);
        },
        tokenExpired: sinon.stub(),
        protocol: new KuzzleEventEmitter(),
        emit: sinon.stub(),
      },
      tokenExpired: sinon.stub()
    };

    controller.kuzzle.protocol.id = 'kuz-protocol-id';
  });

  describe('constructor', () => {
    it('should create a Room instance with good properties', () => {
      const body = {foo: 'bar'};
      const cb = sinon.stub();

      controller.kuzzle.autoResubscribe = 'default';

      const room = new Room(
        controller, 'index', 'collection', body, cb, options);

      should(room.controller).be.equal(controller);
      should(room.kuzzle).be.equal(controller.kuzzle);
      should(room.index).be.equal('index');
      should(room.collection).be.equal('collection');

      should(room.callback).be.equal(cb);
      should(room.options).be.equal(options);

      should(room.id).be.null();
      should(room.channel).be.null();

      should(room.request.controller).be.equal('realtime');
      should(room.request.action).be.equal('subscribe');
      should(room.request.index).be.equal('index');
      should(room.request.collection).be.equal('collection');
      should(room.request.body).be.equal(body);
      should(room.request.scope).be.undefined();
      should(room.request.state).be.undefined();
      should(room.request.users).be.undefined();
      should(room.request.volatile).be.undefined();

      should(room.autoResubscribe).be.equal('default');
      should(room.subscribeToSelf).be.a.Boolean().and.be.True();
    });

    it('should handle scope/state/users/volatile options', () => {
      const opts = {
        scope: 'scope',
        state: 'state',
        users: 'users',
        volatile: 'volatile'
      };
      const body = {foo: 'bar'};
      const cb = sinon.stub();

      const room = new Room(controller, 'index', 'collection', body, cb, opts);

      should(room.request.scope).be.equal('scope');
      should(room.request.state).be.equal('state');
      should(room.request.users).be.equal('users');
      should(room.request.volatile).be.equal('volatile');
    });

    it('should handle autoResubscribe option', () => {
      const body = {foo: 'bar'};
      const cb = sinon.stub();

      controller.kuzzle.autoResubscribe = 'default';

      const room1 = new Room(
        controller, 'index', 'collection', body, cb, {autoResubscribe: true});
      const room2 = new Room(
        controller, 'index', 'collection', body, cb,
        {autoResubscribe: false});
      const room3 = new Room(
        controller, 'index', 'collection', body, cb,
        {autoResubscribe: 'foobar'});

      should(room1.autoResubscribe).be.a.Boolean().and.be.True();
      should(room2.autoResubscribe).be.a.Boolean().and.be.False();
      should(room3.autoResubscribe).be.equal('default');
    });

    it('should handle subscribeToSelf option', () => {
      const body = {foo: 'bar'};
      const cb = sinon.stub();

      const room1 = new Room(
        controller, 'index', 'collection', body, cb, {subscribeToSelf: true});
      const room2 = new Room(
        controller, 'index', 'collection', body, cb,
        {subscribeToSelf: false});
      const room3 = new Room(
        controller, 'index', 'collection', body, cb,
        {subscribeToSelf: 'foobar'});

      should(room1.subscribeToSelf).be.a.Boolean().and.be.True();
      should(room2.subscribeToSelf).be.a.Boolean().and.be.False();
      should(room3.subscribeToSelf).be.a.Boolean().and.be.True();
    });
  });

  describe('subscribe', () => {
    const response = {
      result: {
        roomId: 'my-room-id',
        channel: 'subscription-channel'
      }
    };

    beforeEach(() => {
      controller.kuzzle.query.resolves(response);
    });

    it('should call realtime/subscribe action with subscribe filters and return a promise that resolve the roomId and channel', () => {
      const opts = {
        opt: 'in',
        scope: 'in',
        state: 'done',
        users: 'all',
        volatile: {bar: 'foo'}
      };
      const body = {foo: 'bar'};
      const cb = sinon.stub();
      const room = new Room(controller, 'index', 'collection', body, cb, opts);

      return room.subscribe()
        .then(res => {
          should(controller.kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'realtime',
              action: 'subscribe',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'},
              scope: 'in',
              state: 'done',
              users: 'all',
              volatile: {bar: 'foo'}
            }, opts);

          should(res).be.equal(response);
        });
    });

    it('should set "id" and "channel" properties', () => {
      const opts = {
        opt: 'in',
        scope: 'in',
        state: 'done',
        users: 'all',
        volatile: {bar: 'foo'}
      };
      const body = {foo: 'bar'};
      const cb = sinon.stub();
      const room = new Room(controller, 'index', 'collection', body, cb, opts);

      return room.subscribe()
        .then(() => {
          should(room.id).be.equal('my-room-id');
          should(room.channel).be.equal('subscription-channel');
        });
    });

    it('should call _channelListener while receiving data on the current channel', () => {
      const opts = {
        opt: 'in',
        scope: 'in',
        state: 'done',
        users: 'all',
        volatile: {bar: 'foo'}
      };
      const body = {foo: 'bar'};
      const cb = sinon.stub();
      const room = new Room(controller, 'index', 'collection', body, cb, opts);

      room._channelListener = sinon.stub();

      return room.subscribe()
        .then(() => {
          controller.kuzzle.protocol.emit('my-room-id', 'message 1');
          controller.kuzzle.protocol.emit('subscription-channel', 'message 2');
          controller.kuzzle.protocol.emit('subscription-channel', 'message 3');
          should(room._channelListener).be.calledTwice();
          should(room._channelListener.firstCall).be.calledWith('message 2');
          should(room._channelListener.secondCall).be.calledWith('message 3');
        });
    });

  });

  describe('removeListeners', () => {
    let room;

    beforeEach(() => {
      room = new Room(
        controller, 'index', 'collection', {foo: 'bar'}, sinon.stub(), options);
      room.id = 'my-room-id';
      room.channel = 'subscription-channel';
    });

    it('should not listen to channel messages anymore', () => {
      room._channelListener = sinon.stub();
      controller.kuzzle.protocol.on(
        'subscription-channel', room._channelListener);

      should(room._channelListener).not.be.called();
      controller.kuzzle.protocol.emit('subscription-channel', 'message');
      should(room._channelListener).be.calledOnce();

      room._channelListener.reset();
      room.removeListeners();
      controller.kuzzle.protocol.emit('subscription-channel', 'message');
      should(room._channelListener).not.be.called();
    });

  });

  describe('_channelListener', () => {
    let cb;
    let room;

    beforeEach(() => {
      cb = sinon.stub();
      room = new Room(
        controller, 'index', 'collection', {foo: 'bar'}, cb, options);
      room.id = 'my-room-id';
      room.channel = 'subscription-channel';
    });

    it('should call the callback if subscribeToSelf option is TRUE and the notification message comes from another user', () => {
      room.subscribeToSelf = true;

      const data = {foo: 'bar'};

      room._channelListener(data);
      should(cb)
        .be.calledOnce()
        .be.calledWith(data);

      cb.reset();
      data.volatile = {sdkInstanceId: 'another-client'};
      room._channelListener(data);
      should(cb)
        .be.calledOnce()
        .be.calledWith(data);
    });

    it('should call the callback if subscribeToSelf option is FALSE and the notification message comes from another user', () => {
      room.subscribeToSelf = false;

      const data = {foo: 'bar'};

      room._channelListener(data);
      should(cb)
        .be.calledOnce()
        .be.calledWith(data);

      cb.reset();
      data.volatile = {sdkInstanceId: 'another-client'};
      room._channelListener(data);
      should(cb)
        .be.calledOnce()
        .be.calledWith(data);
    });

    it('should call the callback if subscribeToSelf option is TRUE and the notification message comes from current user', () => {
      room.subscribeToSelf = true;

      const data = {
        foo: 'bar',
        volatile: {sdkInstanceId: 'kuz-protocol-id'}
      };

      room._channelListener(data);
      should(cb)
        .be.calledOnce()
        .be.calledWith(data);
    });

    it('should call the callback if subscribeToSelf option is FALSE and the notification message comes from current user', () => {
      room.subscribeToSelf = false;

      const data = {
        foo: 'bar',
        volatile: {sdkInstanceId: 'kuz-protocol-id'}
      };

      room._channelListener(data);
      should(cb).not.be.called();
    });

    it('should redirect a tokenExpired notification to kuzzle', () => {
      const data = {
        type: 'TokenExpired',
        foo: 'bar'
      };

      room._channelListener(data);

      should(cb).not.be.called();
      should(controller.kuzzle.tokenExpired).be.called();
    });

    it('should emit an event on callback promise rejection', async () => {
      const data = {foo: 'bar'};
      const callbackError = new Error('callbackPromiseRejection');

      cb.rejects(callbackError);

      await room._channelListener(data);

      should(cb)
        .be.calledOnce()
        .be.calledWith(data);

      should(controller.kuzzle.emit)
        .be.calledOnce()
        .be.calledWithMatch('callbackError', { error: callbackError });
    });
  });
});
