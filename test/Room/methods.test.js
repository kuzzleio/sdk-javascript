var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  Document = require('../../src/Document'),
  Kuzzle = require('../../src/Kuzzle'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Room = rewire('../../src/Room');

describe('Room methods', function () {
  var
    expectedQuery,
    result,
    kuzzle,
    collection;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
    kuzzle.state = 'connected';
    kuzzle.network = new NetworkWrapperMock();
    collection = kuzzle.collection('foo', 'bar');
  });

  describe('#count', function () {
    var room;

    beforeEach(function () {
      result = { result: {count: 42 }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'count',
        controller: 'realtime'
      };
      room = new Room(collection);
      room.roomId = 'foobar';
    });

    it('should send the right query to Kuzzle', function () {
      room.count(sinon.stub);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: {roomId: 'foobar'}}, sinon.match.func);
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { room.count();}).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should delay the request until after subscribing', function () {
      var cb = sinon.stub();

      room.subscribing = true;
      room.count(cb);
      should(kuzzle.query).not.be.called();
      should(room.queue).match([{action: 'count', args: [cb]}]);
    });

    it('should answer with the number of subscribers', function (done) {
      this.timeout(50);

      room.count(function (err, res) {
        should(err).be.null();
        should(res).be.a.Number().and.be.exactly(42);
        done();
      });
      kuzzle.query.yield(null, result);
    });

    it('should resolve the callback with an error if one occurs', function (done) {
      this.timeout(50);

      room.count(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });

    it('should fail if the room has no room ID', function () {
      room.roomId = undefined;
      should(function () {room.count(sinon.stub());}).throw();
    });
  });

  describe('#renew', function () {
    var
      room,
      revert,
      dequeued;

    beforeEach(function () {
      dequeued = false;
      revert = Room.__set__('dequeue', function () {dequeued = true;});
      result = { result: {roomId: 'foobar', channel: 'barfoo' }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'subscribe',
        controller: 'realtime'
      };
      room = new Room(collection);
    });

    afterEach(function () {
      revert();
    });

    it('should send the right query to Kuzzle', function () {
      var
        before = Date.now();

      room.renew({}, sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery);
      kuzzle.query.yield(null, result);
      should(room.lastRenewal).be.within(before, Date.now());
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { room.renew();}).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle arguments properly', function (done) {
      this.timeout(50);

      room.renew(sinon.stub(), function (err, res) {
        should(res).be.exactly(room);
        done(err);
      });
      kuzzle.query.yield(null, result);
    });

    it('should delay the request until after subscribing', function () {
      var cb = sinon.stub();
      room.subscribing = true;
      room.renew({}, cb, cb);
      should(kuzzle.query).not.be.called();
      should(room.queue).match([{action: 'renew', args: [{}, cb, cb]}]);
    });

    it('should reset subscribing when network error occurs', function () {
      var cb = sinon.stub();
      room.renew({}, cb, cb);
      should(room.subscribing).be.true();

      kuzzle.connect();
      kuzzle.network.emit('networkError', new Error('foo'));

      should(room.subscribing).be.false();
      should(kuzzle.query).be.called();
    });

    it('should register itself in the global subscription list', function () {
      room.renew({}, sinon.stub());
      kuzzle.query.yield(null, result);
      should(kuzzle.subscriptions.foobar).be.an.Object().and.not.be.empty();
      should(kuzzle.subscriptions.foobar[room.id]).be.exactly(room);
    });

    it('should start dequeuing if subscribed successfully', function (done) {
      room.renew({}, sinon.stub());
      kuzzle.query.yield(null, result);

      setTimeout(function () {
        should(dequeued).be.true();
        done();
      }, 10);
    });

    it('should rejects the callback and empty the queue if the subscription fails', function (done) {
      room.queue.push({foo: 'bar'});
      room.renew({}, function () {}, function (err, res) {
        should(err).not.be.null();
        should(res).be.undefined();
        should(dequeued).be.false();
        should(room.lastRenewal).be.null();
        should(room.queue).be.empty();
        done();
      });

      kuzzle.query.yield('foobar');
    });

    it('should register itself to Kuzzle and skip subscription if not connected', function () {
      kuzzle.state = 'foo';
      kuzzle.query.yields(null, result);
      room.renew({}, sinon.stub());
      should(room.lastRenewal).be.null();
      should(kuzzle.subscriptions.pending[room.id]).be.eql(room);
      should(dequeued).be.false();
      should(kuzzle.query).not.be.called();
    });

    it('should not renew subscription if another renewal was performed before the allowed delay', function () {
      var
        before = Date.now(),
        after;

      kuzzle.query.yields(null, result);
      room.renew({}, sinon.stub());
      after = Date.now();
      room.renew({}, sinon.stub());
      room.renew({}, sinon.stub());

      should(kuzzle.query).be.calledOnce();
      should(room.lastRenewal).be.within(before, after);
    });
  });

  describe('#setHeaders', function () {
    it('should set headers properly', function () {
      var room = new Room(collection);
      should(room.setHeaders({foo: 'bar'})).be.exactly(room);
      should(room.headers).match({foo: 'bar'});
    });
  });

  describe('#unsubscribe', function () {
    var
      room,
      socketOff;

    beforeEach(function () {
      kuzzle.socket = {
        off: function () { socketOff = true; }
      };

      socketOff = true;
      result = { result: {}};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'unsubscribe',
        controller: 'realtime'
      };

      room = new Room(collection);
      room.roomId = 'foobar';
      room.channel = 'barfoo';
      room.notifier = sinon.stub();
      kuzzle.subscriptions.foobar = {};
      kuzzle.subscriptions.foobar[room.id] = room;
    });

    it('should stop listening to the socket room once subscription has stopped', function () {
      should(room.unsubscribe()).be.exactly(room);
      should(socketOff).be.true();
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery);
      should(kuzzle.subscriptions.foobar).be.undefined();
    });

    it('should not emit an unsubscribe request if another Room is listening to that room', function () {
      kuzzle.subscriptions.foobar.foo = {};
      should(room.unsubscribe()).be.exactly(room);
      should(socketOff).be.true();
      should(kuzzle.query).not.be.called();
      should(kuzzle.subscriptions.foobar).not.be.empty();
      should(Object.keys(kuzzle.subscriptions.foobar).length).be.exactly(1);
      should(kuzzle.subscriptions.foobar.foo).not.be.undefined();
    });

    it('should unsubscribe only after all pending subscriptions are finished', function (done) {
      this.timeout(150);

      kuzzle.subscriptions.pending.foo = {};
      should(room.unsubscribe()).be.exactly(room);
      should(socketOff).be.true();
      should(kuzzle.query).not.be.called();
      should(kuzzle.subscriptions.foobar).be.undefined();
      kuzzle.subscriptions.pending = {};
      setTimeout(function () {
        should(kuzzle.query).be.calledOnce();
        done();
      }, 100);
    });

    it('should not unsubscribe if pending actions were subscriptions on that room', function (done) {
      this.timeout(150);

      kuzzle.subscriptions.pending.foo = {};
      should(room.unsubscribe()).be.exactly(room);
      should(socketOff).be.true();
      should(kuzzle.query).not.be.called();
      should(kuzzle.subscriptions.foobar).be.undefined();
      kuzzle.subscriptions.pending = {};
      kuzzle.subscriptions.foobar = {};
      kuzzle.subscriptions.foobar.foo = {};
      setTimeout(function () {
        should(kuzzle.query).not.be.called();
        done();
      }, 100);
    });

    it('should delay the unsubscription until after the current subscription is done', function () {
      room.subscribing = true;
      should(room.unsubscribe()).be.exactly(room);
      should(room.queue).match([{action: 'unsubscribe', args: []}]);
    });
  });

  describe('#dequeue', function () {
    var
      dequeue = Room.__get__('dequeue'),
      room;

    beforeEach(function () {
      room = new Room(collection);
      room.count = sinon.stub();
      room.renew = sinon.stub();
      room.unsubscribe = sinon.stub();
    });

    it('should replay requests queued while refreshing', function () {
      dequeue.call(room);
      should(room.count).not.be.called();
      should(room.renew).not.be.called();
      should(room.unsubscribe).not.be.called();

      room.queue.push({action: 'count', args: []});
      room.queue.push({action: 'renew', args: []});
      room.queue.push({action: 'unsubscribe', args: []});
      dequeue.call(room);
      should(room.count).be.calledOnce();
      should(room.renew).be.calledOnce();
      should(room.unsubscribe).be.calledOnce();
    });
  });

  describe('#notificationCallback', function () {
    var
      notifCB = Room.__get__('notificationCallback'),
      room;

    beforeEach(function () {
      result = undefined;
      room = new Room(collection);
      room.callback = sinon.stub();
    });

    it('should handle document notifications', function () {
      notifCB.call(room, {
        controller: 'document',
        type: 'document',
        result: {
          _id: 'id',
          _source: {
            foo: 'bar'
          }
        }
      });

      should(room.callback)
        .be.calledOnce()
        .be.calledWithMatch(null, {
          controller: 'document',
          type: 'document',
          document: {
            id: 'id',
            content: {
              foo: 'bar'
            }
          }
        });
      should(room.callback.firstCall.args[1].document)
        .be.an.instanceOf(Document);
    });

    it('should handle realtime publish notifications', function () {
      notifCB.call(room, {
        controller: 'realtime',
        action: 'publish',
        type: 'document',
        result: {
          _source: {
            foo: 'bar'
          }
        }
      });

      should(room.callback)
        .be.calledOnce()
        .be.calledWithMatch(null, {
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
      should(room.callback.firstCall.args[1].document)
        .be.an.instanceOf(Document);
    });

    it('should handle user notifications', function () {
      notifCB.call(room, {
        controller: 'realtime',
        result: { count: 3 },
        type: 'user',
        user: 'in'
      });

      should(room.callback)
        .be.calledOnce()
        .be.calledWithMatch(null, {
          result: { count: 3 },
          type: 'user',
          user: 'in',
        });
    });

    it('should not forward the message if subscribeToSelf is false and the response comes from a query emitted by this instance', function () {
      room.subscribeToSelf = false;

      notifCB.call(room, {type: 'document', result: {}, action: 'foo', volatile: {sdkInstanceId: kuzzle.id}});
      should(room.callback).not.be.called();

      room.callback.resetHistory();
      notifCB.call(room, {type: 'document', result: {}, action: 'foo', volatile: {sdkInstanceId: 'foobar'}});
      should(room.callback).be.calledOnce();

      room.callback.resetHistory();
      notifCB.call(room, {type: 'document', result: {}, action: 'foo', volatile: {barfoo: 'foobar'}});
      should(room.callback).be.calledOnce();

      room.callback.resetHistory();
      notifCB.call(room, {type: 'document', result: {}, action: 'foo'});
      should(room.callback).be.calledOnce();
    });

    it('should fire a "tokenExpired" event when receiving a TokenExpired notification', function () {
      kuzzle.emitEvent = sinon.stub();

      notifCB.call(room, {type: 'TokenExpired'});
      should(kuzzle.emitEvent).be.calledOnce();
      should(kuzzle.emitEvent).be.calledWith('tokenExpired');
    });
  });
});
