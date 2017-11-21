var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  CollectionMock = require('../mocks/collection.mock'),
  KuzzleMock = require('../mocks/kuzzle.mock'),
  Room = rewire('../../src/Room');

describe('Room methods', function () {
  var
    expectedQuery,
    result,
    kuzzle,
    collection,
    room;

  beforeEach(function () {
    kuzzle = new KuzzleMock();
    kuzzle.network.state = 'connected';
    collection = new CollectionMock(kuzzle);
    room = new Room(collection, {equals: {foo: 'bar'}});
  });

  describe('#count', function () {
    beforeEach(function () {
      result = { result: {count: 42 }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'count',
        controller: 'realtime'
      };

      room.roomId = 'foobar';
      room.active = true;
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
      room = new Room(collection, {equals: {foo: 'bar'}});
      should(function () {room.count(sinon.stub());}).throw('Room.count: cannot count subscriptions on an inactive room');
    });
  });

  describe('#dequeue', function () {
    var dequeue = Room.__get__('dequeue');

    beforeEach(function () {
      room.count = sinon.stub();
      room.renew = sinon.stub();
      room.unsubscribe = sinon.stub();
    });

    it('should replay requests queued while refreshing', function () {
      dequeue(room);
      should(room.count).not.be.called();
      should(room.renew).not.be.called();
      should(room.unsubscribe).not.be.called();

      room.queue.push({action: 'count', args: ['foo']});
      room.queue.push({action: 'renew', args: ['bar']});
      room.queue.push({action: 'unsubscribe', args: ['baz']});
      dequeue(room);
      should(room.count)
        .be.calledOnce()
        .be.calledWith('foo');
      should(room.renew)
        .be.calledOnce()
        .be.calledWith('bar');
      should(room.unsubscribe)
        .be.calledOnce()
        .be.calledWith('baz');
    });
  });

  describe('#notify', function() {
    var
      documentCB,
      userCB;

    beforeEach(function() {
      documentCB = sinon.stub();
      userCB = sinon.stub();

      room.on('document', documentCB);
      room.on('user', userCB);
    });

    it('should throw an error if the data type is not defined', function() {
      should(function() {room.notify({foo: 'bar'});}).throw('Room.notify: argument must match {type: <document|user>}');
      should(documentCB).not.be.called();
      should(userCB).not.be.called();
    });

    describe(' # with subscribeToSelf==true', function() {
      beforeEach(function() {
        room.subscribeToSelf = true;
      });

      it('should emit events if the notification comes from another client', function() {
        var
          dataDoc = {type: 'document', foo: 'bar', fromSelf: false},
          dataUser = {type: 'user', bar: 'foo', fromSelf: false};

        room.notify(dataDoc);
        room.notify(dataUser);
        should(documentCB).be.calledOnce().be.calledWith(dataDoc);
        should(userCB).be.calledOnce().be.calledWith(dataUser);
      });

      it('should emit events if the notification comes from current client', function() {
        var
          dataDoc = {type: 'document', foo: 'bar', fromSelf: true},
          dataUser = {type: 'user', bar: 'foo', fromSelf: true};

        room.notify(dataDoc);
        room.notify(dataUser);
        should(documentCB).be.calledOnce().be.calledWith(dataDoc);
        should(userCB).be.calledOnce().be.calledWith(dataUser);
      });
    });

    describe(' # with subscribeToSelf==false', function() {
      beforeEach(function() {
        room.subscribeToSelf = false;
      });

      it('should emit events if the notification comes from another client', function() {
        var
          dataDoc = {type: 'document', foo: 'bar', fromSelf: false},
          dataUser = {type: 'user', bar: 'foo', fromSelf: false};

        room.notify(dataDoc);
        room.notify(dataUser);
        should(documentCB).be.calledOnce().be.calledWith(dataDoc);
        should(userCB).be.calledOnce().be.calledWith(dataUser);
      });

      it('should not emit events if the notification comes from current client', function() {
        var
          dataDoc = {type: 'document', foo: 'bar', fromSelf: true},
          dataUser = {type: 'user', bar: 'foo', fromSelf: true};

        room.notify(dataDoc);
        room.notify(dataUser);
        should(documentCB).not.be.called();
        should(userCB).not.be.called();
      });
    });
  });

  describe('#onDone', function() {
    it('should thow an error if the callback argument is missing', function() {
      should(function() {room.onDone();}).throw('Room.onDone: as callback argument is required.');
    });

    it('should thow an error if the callback argument is not a function', function() {
      should(function() {room.onDone('foobar');}).throw('Room.onDone: as callback argument is required.');
    });

    it('should call immediatly the callback if the room has an error', function() {
      var cb = sinon.stub();

      room.error = 'foobar';
      room.onDone(cb);

      should(room.listeners('done')).be.empty();
      should(cb)
        .be.calledOnce()
        .be.calledWith('foobar');
    });

    it('should call immediatly the callback if the room subscription is already active', function() {
      var cb = sinon.stub();

      room.active = true;
      room.onDone(cb);

      should(room.listeners('done')).be.empty();
      should(cb)
        .be.calledOnce()
        .be.calledWith(null, room);
    });

    it('should register the callback to "done" event if the room is still subscribing', function() {
      var cb = sinon.stub();

      room.onDone(cb);

      should(room.listeners('done')).not.be.empty();
      should(cb).not.be.called();

      room.emit('done', null, room);
      should(cb)
        .be.calledOnce()
        .be.calledWith(null, room);
      should(room.listeners('done')).be.empty();
    });
  });

  describe('#renew', function () {
    beforeEach(function () {
      room.subscribe = sinon.stub();
      room.unsubscribe = sinon.stub();
    });

    it('should force room resubscribe if not already subscribing', function () {
      var cb = sinon.stub();

      room.renew(cb);
      should(room.unsubscribe).be.calledOnce();
      should(room.unsubscribe.firstCall.args).be.empty();
      should(room.subscribe).be.calledOnce();
      should(room.subscribe).calledWith(cb);
    });

    it('should delay the request until after subscribing', function () {
      room.subscribing = true;
      room.renew();
      should(room.subscribe).not.be.called();
      should(room.queue).match([{action: 'renew', args: []}]);
    });

    it('should not renew subscription if another renewal was performed before the allowed delay', function () {
      var
        listener = sinon.stub(),
        cb = sinon.stub();

      room.on('done', listener);
      room.renew(cb);
      room.lastRenewal = Date.now();
      room.renew(cb);
      room.renew(cb);

      should(room.subscribe)
        .be.calledOnce()
        .be.calledWith(cb);

      should(cb)
        .be.calledTwice()
        .be.alwaysCalledWith(sinon.match(function(arg) {
          return arg instanceof Error
            && arg.message === 'Subscription already renewed less than ' + room.renewalDelay + 'ms ago';
        }));

      should(listener)
        .be.calledTwice()
        .be.alwaysCalledWith(sinon.match(function(arg) {
          return arg instanceof Error
            && arg.message === 'Subscription already renewed less than ' + room.renewalDelay + 'ms ago';
        }));
    });
  });

  describe('#subscribe', function() {
    var
      revert,
      dequeue;

    beforeEach(function () {
      dequeue = sinon.stub();
      revert = Room.__set__('dequeue', dequeue);
      result = {roomId: 'foobar', channel: 'barfoo' };
    });

    afterEach(function () {
      revert();
    });

    it('should send the right subscribe query to Kuzzle', function () {
      var
        opts = {foo: 'bar'},
        cb = sinon.stub(),
        before = Date.now();

      room.subscribe();
      should(kuzzle.subscribe).be.calledOnce();
      should(kuzzle.subscribe).calledWith(room, undefined);
      kuzzle.subscribe.yield(null, result);
      should(room.roomId).be.exactly('foobar');
      should(room.channel).be.exactly('barfoo');
      should(room.lastRenewal).be.within(before, Date.now());

      kuzzle.subscribe.reset();
      room.active = false;
      room.subscribe(cb);
      should(kuzzle.subscribe).be.calledOnce();
      should(kuzzle.subscribe).calledWith(room, null);

      kuzzle.subscribe.reset();
      room.subscribing = false;
      room.roomId = null;
      room.subscribe(opts);
      should(kuzzle.subscribe).be.calledOnce();
      should(kuzzle.subscribe).calledWith(room, opts);

      kuzzle.subscribe.reset();
      room.subscribing = false;
      room.roomId = null;
      room.subscribe(opts, cb);
      should(kuzzle.subscribe).be.calledOnce();
      should(kuzzle.subscribe).calledWith(room, opts);
    });

    it('should register the callback and delay if the room is still subscribing', function() {
      var
        spy = sinon.spy(room,'onDone'),
        cb = sinon.stub();

      room.subscribing = true;
      room.subscribe(cb);
      should(kuzzle.subscribe).not.be.called();
      should(spy).be.calledOnce().be.calledWith(cb);
      should(cb).not.be.called();
    });

    it('should not subscribe again and call directly the callback if the subscription is already active', function() {
      var
        spy = sinon.spy(room,'onDone'),
        cb = sinon.stub();

      room.active = true;
      room.subscribe(cb);
      should(kuzzle.subscribe).not.be.called();
      should(spy).be.calledOnce().be.calledWith(cb);
      should(cb).be.calledOnce().be.calledWith(null, room);
    });

    it('should delay and wait for the "connected" event if the network state is still offline', function() {
      var cb = sinon.stub();

      room.subscribe(cb);

      kuzzle.subscribe.yield(new Error('Not Connected'));
      should(room.subscribing).be.true();
      should(room.roomId).be.null();
      should(room.channel).be.null();
      should(cb).not.be.called();

      kuzzle.subscribe.reset();
      kuzzle.emit('connected');
      should(kuzzle.subscribe).be.calledOnce();
      kuzzle.subscribe.yield(null, result);

      should(room.subscribing).be.false();
      should(room.roomId).be.exactly('foobar');
      should(room.channel).be.exactly('barfoo');
      should(cb).be.calledOnce();
    });

    it('should call the callback if given', function (done) {
      room.subscribe(function(err, res) {
        should(err).be.null();
        should(res).be.exactly(room);
        done();
      });
      kuzzle.subscribe.yield(null, result);
    });

    it('should disable the subscription when network error occurs', function () {
      room.subscribe();

      should(kuzzle.subscribe).be.calledOnce();
      kuzzle.subscribe.yield(null, result);

      should(room.roomId).be.exactly('foobar');
      should(room.channel).be.exactly('barfoo');
      kuzzle.emit('networkError', new Error('foobar'));

      should(room.active).be.false();
    });

    it('should renew the subscription when the JWT is expired', function () {
      room.renew = sinon.stub();

      room.subscribe();
      should(room.renew).not.be.called();

      kuzzle.subscribe.yield(null, result);
      kuzzle.emit('tokenExpired');
      should(room.renew).be.calledOnce();
    });

    it('should renew the subscription when the user is successfully logged-in', function () {
      room.renew = sinon.stub();

      room.subscribe();
      should(room.renew).not.be.called();

      kuzzle.subscribe.yield(null, result);
      kuzzle.emit('loginAttempt', {success: true});
      should(room.renew).be.calledOnce();

      room.renew.reset();
      kuzzle.subscribe.yield(null, result);
      kuzzle.emit('loginAttempt', {success: false});
      should(room.renew).not.be.called();
    });

    it('should renew the subscription when the user is reconnected and the "autoResubscribe" option is set', function () {
      room = new Room(collection, {equals: {foo: 'bar'}}, {autoResubscribe: true});
      sinon.stub(room, 'renew');
      room.subscribe();
      should(room.renew).not.be.called();

      kuzzle.subscribe.yield(null, result);
      kuzzle.emit('reconnected', {success: true});
      should(room.renew).be.calledOnce();

      room = new Room(collection, {equals: {foo: 'bar'}}, {autoResubscribe: false});
      sinon.stub(room, 'renew');
      kuzzle.subscribe.yield(null, result);
      kuzzle.emit('reconnected', {success: true});
      should(room.renew).not.be.called();
    });

    it('should start dequeuing if subscribed successfully', function () {
      room.subscribe();
      kuzzle.subscribe.yield(null, result);
      should(dequeue).be.calledOnce();
    });

    it('should rejects the callback and empty the queue if the subscription fails', function (done) {
      room.queue.push({foo: 'bar'});

      room.onDone(function (err, res) {
        should(err).not.be.null();
        should(res).be.undefined();
        should(dequeue).not.be.called();
        should(room.lastRenewal).be.null();
        should(room.queue).be.empty();
        done();
      });
      room.subscribe();

      kuzzle.subscribe.yield('foobar');
    });
  });

  describe('#unsubscribe', function () {
    beforeEach(function () {
      result = { result: {}};

      room.roomId = 'foobar';
      room.channel = 'barfoo';
      room.active = true;
      room.notify = sinon.stub();
    });

    it('should forward the unsubscribe request to Kuzzle', function () {
      var
        opts = {foo: 'bar'},
        cb = sinon.stub();

      should(room.unsubscribe()).be.exactly(room);
      should(kuzzle.unsubscribe).be.calledOnce();
      should(kuzzle.unsubscribe).calledWith(room, undefined, undefined);

      room.active = true;
      kuzzle.unsubscribe.reset();
      room.unsubscribe(cb);
      should(kuzzle.unsubscribe).be.calledOnce();
      should(kuzzle.unsubscribe).calledWith(room, null, cb);

      room.active = true;
      kuzzle.unsubscribe.reset();
      room.unsubscribe(opts);
      should(kuzzle.unsubscribe).be.calledOnce();
      should(kuzzle.unsubscribe).calledWith(room, opts, undefined);

      room.active = true;
      kuzzle.unsubscribe.reset();
      room.unsubscribe(opts, cb);
      should(kuzzle.unsubscribe).be.calledOnce();
      should(kuzzle.unsubscribe).calledWith(room, opts, cb);
    });

    it('should delay the unsubscription until after the current subscription is done', function () {
      var
        opts = {foo: 'bar'},
        cb = sinon.stub();

      room.subscribing = true;
      should(room.unsubscribe()).be.exactly(room);
      should(room.queue).match([{action: 'unsubscribe', args: []}]);

      room.queue = [];
      room.unsubscribe(cb);
      should(room.queue).match([{action: 'unsubscribe', args: [cb]}]);

      room.queue = [];
      room.unsubscribe(opts);
      should(room.queue).match([{action: 'unsubscribe', args: [opts]}]);

      room.queue = [];
      room.unsubscribe(opts, cb);
      should(room.queue).match([{action: 'unsubscribe', args: [opts, cb]}]);
    });

    it('should not send the unsubscribe request if the room is already inactive', function () {
      room.active = false;

      should(room.unsubscribe()).be.exactly(room);
      should(kuzzle.unsubscribe).not.be.called();
    });
  });
});
