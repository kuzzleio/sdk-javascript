const
  RealtimeController = require('../../src/controllers/realtime'),
  mockrequire = require('mock-require'),
  sinon = require('sinon'),
  should = require('should'),
  uuidv4 = require('../../src/uuidv4');

describe('Realtime Controller', () => {
  const options = {opt: 'in'};
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };
    kuzzle.realtime = new RealtimeController(kuzzle);
  });

  after(() => {
    mockrequire.stopAll();
  });

  describe('#count', () => {
    it('should throw an error if the "roomId" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.count(undefined, options);
      }).throw('Kuzzle.realtime.count: roomId is required');
    });

    it('should call realtime/count query with the roomId and return a Promise which resolves a number', () => {
      kuzzle.query.resolves({roomId: 'roomId', count: 1234});

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

  describe('#list', () => {
    it('should call realtime/lsit query and return a Promise which resolves json', () => {
      const result = {
        foo: {
          bar: {
            afbfc7fde06bde6bb757d077f62722d1: 12,
            a31fa5eee8f466714c4f643d6eb96f2f: 4
          },
          baz: {
            b589ad149a0f499ffd0c0d03d8b7e9db: 1
          }
        },
        bar: {
          foo: {
            bedf9581d24f0772490f0cd95d9646a8: 42
          }
        }
      };
      kuzzle.query.resolves(result);

      return kuzzle.realtime.list(options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'realtime',
              action: 'list'
            }, options);

          should(res).be.equal(result);
        });
    });
  });

  describe('#publish', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.publish(undefined, 'collection', {}, options);
      }).throw('Kuzzle.realtime.publish: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.publish('index', undefined, {}, options);
      }).throw('Kuzzle.realtime.publish: collection is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.publish('index', 'collection', undefined, options);
      }).throw('Kuzzle.realtime.publish: body is required');
    });

    it('should call realtime/publish query with the index, collection and body and return a Promise which resolves an acknowledgement', () => {
      kuzzle.query.resolves({published: true});

      return kuzzle.realtime.publish('index', 'collection', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'realtime',
              action: 'publish',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'}
            }, options);

          should(res.published).be.a.Boolean().and.be.true();
        });
    });
  });

  describe('#subscribe', () => {
    const
      roomId = uuidv4(),
      subscribeResponse = {
        roomId,
        channel: 'notification-channel'
      };

    let room;

    beforeEach(() => {
      room = null;

      mockrequire('../../src/controllers/realtime/room', function (kuz, index, collection, body, callback, opts = {}) {
        room = {
          kuzzle: kuz,
          index,
          collection,
          body,
          callback,
          options: opts,
          id: roomId,
          subscribe: sinon.stub().resolves(subscribeResponse)
        };

        return room;
      });

      kuzzle.realtime = new (mockrequire.reRequire('../../src/controllers/realtime/index'))(kuzzle);
    });

    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.subscribe(undefined, 'collection', {}, sinon.stub(), options);
      }).throw('Kuzzle.realtime.subscribe: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.subscribe('index', undefined, {}, sinon.stub(), options);
      }).throw('Kuzzle.realtime.subscribe: collection is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.subscribe('index', 'collection', undefined, sinon.stub(), options);
      }).throw('Kuzzle.realtime.subscribe: body is required');
    });

    it('should throw an error if the "callback" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.subscribe('index', 'collection', {}, undefined, options);
      }).throw('Kuzzle.realtime.subscribe: a callback function is required');
    });

    it('should throw an error if the "callback" argument is not a function', () => {
      should(function () {
        kuzzle.realtime.subscribe('index', 'collection', {}, 'foobar', options);
      }).throw('Kuzzle.realtime.subscribe: a callback function is required');
    });

    it('should create a Room object with the propataged arguments and bind subscribe() method to it', () => {
      const
        body = {foo: 'bar'},
        cb = sinon.stub();
      return kuzzle.realtime.subscribe('index', 'collection', body, cb, options)
        .then(res => {
          should(room.kuzzle).be.equal(kuzzle);
          should(room.index).be.equal('index');
          should(room.collection).be.equal('collection');
          should(room.body).be.equal(body);
          should(room.callback).be.equal(cb);
          should(room.options).be.equal(options);
          should(room.subscribe).be.calledOnce();
          should(res).be.equal(subscribeResponse);
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
    });

    it('should throw an error if the "roomId" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.unsubscribe(undefined, options);
      }).throw('Kuzzle.realtime.unsubscribe: roomId is required');
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

    it('should call realtime/unsubiscribe query with the roomId and return a Promise which resolves the roomId', () => {
      kuzzle.query.resolves(roomId);

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

  describe('validate', () => {
    it('should throw an error if the "index" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.validate(undefined, 'collection', {foo: 'bar'}, options);
      }).throw('Kuzzle.realtime.validate: index is required');
    });

    it('should throw an error if the "collection" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.validate('index', undefined, {foo: 'bar'}, options);
      }).throw('Kuzzle.realtime.validate: collection is required');
    });

    it('should throw an error if the "body" argument is not provided', () => {
      should(function () {
        kuzzle.realtime.validate('index', 'collection', undefined, options);
      }).throw('Kuzzle.realtime.validate: body is required');
    });

    it('should call realtime/validate query and return a Promise which resolves the validation result', () => {
      const result = {
        errorMessages: {},
        valid: true
      };
      kuzzle.query.resolves(result);

      return kuzzle.realtime.validate('index', 'collection', {foo: 'bar'}, options)
        .then(res => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              controller: 'realtime',
              action: 'validate',
              index: 'index',
              collection: 'collection',
              body: {foo: 'bar'}
            }, options);

          should(res).be.equal(result);
        });
    });
  });
});
