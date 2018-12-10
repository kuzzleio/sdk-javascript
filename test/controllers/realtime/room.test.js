const
  Room = require('../../../src/controllers/realtime/room'),
  KuzzleEventEmitter = require('../../../src/eventEmitter'),
  sinon = require('sinon'),
  should = require('should');

describe('Room', () => {
  const
    eventEmitter = new KuzzleEventEmitter(),
    options = {opt: 'in'};

  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves(),
      addListener: (evt, listener) => {
        eventEmitter.addListener(evt, listener);
      },
      removeListener: (evt, listener) => {
        eventEmitter.removeListener(evt, listener);
      },
      protocol: new KuzzleEventEmitter()
    };

    kuzzle.protocol.id = 'kuz-protocol-id';
  });

  describe('constructor', () => {
    it('should create a Room instance with good properties', () => {
      const
        body = {foo: 'bar'},
        cb = sinon.stub();

      kuzzle.autoResubscribe = 'default';

      const room = new Room(kuzzle, 'index', 'collection', body, cb, options);

      should(room.kuzzle).be.equal(kuzzle);
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
      const
        opts = {
          scope: 'scope',
          state: 'state',
          users: 'users',
          volatile: 'volatile'
        },
        body = {foo: 'bar'},
        cb = sinon.stub();

      const room = new Room(kuzzle, 'index', 'collection', body, cb, opts);

      should(room.options).be.empty();

      should(room.request.scope).be.equal('scope');
      should(room.request.state).be.equal('state');
      should(room.request.users).be.equal('users');
      should(room.request.volatile).be.equal('volatile');
    });

    it('should handle autoResubscribe option', () => {
      const
        body = {foo: 'bar'},
        cb = sinon.stub();

      kuzzle.autoResubscribe = 'default';

      const
        room1 = new Room(kuzzle, 'index', 'collection', body, cb, {autoResubscribe: true}),
        room2 = new Room(kuzzle, 'index', 'collection', body, cb, {autoResubscribe: false}),
        room3 = new Room(kuzzle, 'index', 'collection', body, cb, {autoResubscribe: 'foobar'});

      should(room1.options).be.empty();
      should(room2.options).be.empty();
      should(room3.options).be.empty();

      should(room1.autoResubscribe).be.a.Boolean().and.be.True();
      should(room2.autoResubscribe).be.a.Boolean().and.be.False();
      should(room3.autoResubscribe).be.equal('default');
    });

    it('should handle subscribeToSelf option', () => {
      const
        body = {foo: 'bar'},
        cb = sinon.stub();

      const
        room1 = new Room(kuzzle, 'index', 'collection', body, cb, {subscribeToSelf: true}),
        room2 = new Room(kuzzle, 'index', 'collection', body, cb, {subscribeToSelf: false}),
        room3 = new Room(kuzzle, 'index', 'collection', body, cb, {subscribeToSelf: 'foobar'});

      should(room1.options).be.empty();
      should(room2.options).be.empty();
      should(room3.options).be.empty();

      should(room1.subscribeToSelf).be.a.Boolean().and.be.True();
      should(room2.subscribeToSelf).be.a.Boolean().and.be.False();
      should(room3.subscribeToSelf).be.a.Boolean().and.be.True();
    });
  });

  describe('subscribe', () => {
    const response = {result: {roomId: 'my-room-id', channel: 'subscription-channel'}};

    beforeEach(() => {
      kuzzle.query.resolves(response);
    });

    it('should call realtime/subscribe action with subscribe filters and return a promise that resolve the roomId and channel', () => {
      const
        opts = {opt: 'in', scope: 'in', state: 'done', users: 'all', volatile: {bar: 'foo'}},
        body = {foo: 'bar'},
        cb = sinon.stub(),
        room = new Room(kuzzle, 'index', 'collection', body, cb, opts);

      return room.subscribe()
        .then(res => {
          should(kuzzle.query)
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
            }, options);

          should(res).be.equal(response);
        });
    });

    it('should set "id" and "channel" properties', () => {
      const
        opts = {opt: 'in', scope: 'in', state: 'done', users: 'all', volatile: {bar: 'foo'}},
        body = {foo: 'bar'},
        cb = sinon.stub(),
        room = new Room(kuzzle, 'index', 'collection', body, cb, opts);

      return room.subscribe()
        .then(() => {
          should(room.id).be.equal('my-room-id');
          should(room.channel).be.equal('subscription-channel');
        });
    });

    it('should call _channelListener while receiving data on the current channel', () => {
      const
        opts = {opt: 'in', scope: 'in', state: 'done', users: 'all', volatile: {bar: 'foo'}},
        body = {foo: 'bar'},
        cb = sinon.stub(),
        room = new Room(kuzzle, 'index', 'collection', body, cb, opts);

      room._channelListener = sinon.stub();

      return room.subscribe()
        .then(() => {
          kuzzle.protocol.emit('my-room-id', 'message 1');
          kuzzle.protocol.emit('subscription-channel', 'message 2');
          kuzzle.protocol.emit('subscription-channel', 'message 3');
          should(room._channelListener).be.calledTwice();
          should(room._channelListener.firstCall).be.calledWith('message 2');
          should(room._channelListener.secondCall).be.calledWith('message 3');
        });
    });

    it('should call _reSubscribeListener once reconnected', () => {
      const
        opts = {opt: 'in', scope: 'in', state: 'done', users: 'all', volatile: {bar: 'foo'}},
        body = {foo: 'bar'},
        cb = sinon.stub(),
        room = new Room(kuzzle, 'index', 'collection', body, cb, opts);

      room._reSubscribeListener = sinon.stub();

      return room.subscribe()
        .then(() => {
          should(room._reSubscribeListener).not.be.called();
          eventEmitter.emit('reconnected');
          should(room._reSubscribeListener).be.calledOnce();
        });
    });
  });

  describe('removeListeners', () => {
    let room;

    beforeEach(() => {
      room = new Room(kuzzle, 'index', 'collection', {foo: 'bar'}, sinon.stub(), options);
      room.id = 'my-room-id';
      room.channel = 'subscription-channel';
    });

    it('should not listen to channel messages anymore', () => {
      room._channelListener = sinon.stub();
      kuzzle.protocol.on('subscription-channel', room._channelListener);

      should(room._channelListener).not.be.called();
      kuzzle.protocol.emit('subscription-channel', 'message');
      should(room._channelListener).be.calledOnce();

      room._channelListener.reset();
      room.removeListeners();
      kuzzle.protocol.emit('subscription-channel', 'message');
      should(room._channelListener).not.be.called();
    });

    it('should not listen to "reconnected" event anymore', () => {
      room._reSubscribeListener = sinon.stub();
      kuzzle.addListener('reconnected', room._reSubscribeListener);

      should(room._reSubscribeListener).not.be.called();
      eventEmitter.emit('reconnected');
      should(room._reSubscribeListener).be.calledOnce();

      room._reSubscribeListener.reset();
      room.removeListeners();
      eventEmitter.emit('reconnected');
      should(room._reSubscribeListener).not.be.called();
    });
  });

  describe('_channelListener', () => {
    let
      cb,
      room;

    beforeEach(() => {
      cb = sinon.stub();
      room = new Room(kuzzle, 'index', 'collection', {foo: 'bar'}, cb, options);
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
  });

  describe('_reSubscribeListener', () => {
    let
      room;

    beforeEach(() => {
      room = new Room(kuzzle, 'index', 'collection', {foo: 'bar'}, sinon.stub(), options);
      room.subscribe = sinon.stub();
    });

    it('should resubscribe is autoResubscibe option is TRUE', () => {
      room.autoResubscribe = true;
      room._reSubscribeListener();
      should(room.subscribe).be.calledOnce();
    });

    it('should NOT resubscribe is autoResubscibe option is FALSE', () => {
      room.autoResubscribe = false;
      room._reSubscribeListener();
      should(room.subscribe).not.be.called();
    });
  });
});
