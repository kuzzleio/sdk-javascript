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
      room.roomstate = 'active';
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

    it('should force-fail if the room is not active', function () {
      var cb = sinon.stub();

      room.roomstate = 'inactive';
      room.count(cb);

      should(cb).calledOnce();
      should(cb.firstCall.args[0])
        .be.instanceof(Error)
        .and.match({message: 'Cannot count subscriptions on an non-active room'});
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
    it('should throw an error if the callback argument is missing', function() {
      should(function() {room.onDone();}).throw('Room.onDone: a callback argument is required.');
    });

    it('should throw an error if the callback argument is not a function', function() {
      should(function() {room.onDone('foobar');}).throw('Room.onDone: a callback argument is required.');
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

      room.roomstate = 'active';
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

  describe('#subscribe', function() {
    beforeEach(function () {
      result = {roomId: 'foobar', channel: 'barfoo' };
    });

    it('should send the right subscribe query to Kuzzle', function () {
      var
        opts = {foo: 'bar'},
        cb = sinon.stub();

      room.subscribe();
      should(kuzzle.subscribe)
        .be.calledOnce()
        .be.calledWith(room, undefined);
      kuzzle.subscribe.yield(null, result);
      should(room.roomId).be.exactly('foobar');
      should(room.channel).be.exactly('barfoo');

      kuzzle.subscribe.reset();
      room.roomstate = 'inactive';
      room.subscribe(cb);
      should(kuzzle.subscribe).be.calledOnce();
      should(kuzzle.subscribe).calledWith(room, null);

      kuzzle.subscribe.reset();
      room.roomstate = 'inactive';
      room.subscribe(opts);
      should(kuzzle.subscribe).be.calledOnce();
      should(kuzzle.subscribe).calledWith(room, opts);

      kuzzle.subscribe.reset();
      room.roomstate = 'inactive';
      room.subscribe(opts, cb);
      should(kuzzle.subscribe).be.calledOnce();
      should(kuzzle.subscribe).calledWith(room, opts);
    });

    it('should register the callback and delay if the room is still subscribing', function() {
      var
        spy = sinon.spy(room,'onDone'),
        cb = sinon.stub();

      room.roomstate = 'subscribing';
      room.subscribe(cb);
      should(kuzzle.subscribe).not.be.called();
      should(spy).be.calledOnce().be.calledWith(cb);
      should(cb).not.be.called();
    });

    it('should not subscribe again and call directly the callback if the subscription is already active', function() {
      var
        spy = sinon.spy(room,'onDone'),
        cb = sinon.stub();

      room.roomstate = 'active';
      room.subscribe(cb);
      should(kuzzle.subscribe).not.be.called();
      should(spy).be.calledOnce().be.calledWith(cb);
      should(cb).be.calledOnce().be.calledWith(null, room);
    });

    it('should delay and wait for the "connected" event if the network state is still offline', function() {
      var cb = sinon.stub();

      room.subscribe(cb);

      kuzzle.subscribe.yield(new Error('Not Connected'));
      should(room.roomstate).be.eql('subscribing');
      should(room.roomId).be.null();
      should(room.channel).be.null();
      should(cb).not.be.called();

      kuzzle.subscribe.reset();
      kuzzle.emit('connected');
      should(kuzzle.subscribe).be.calledOnce();
      kuzzle.subscribe.yield(null, result);

      should(room.roomstate).be.eql('active');
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

    it('should disable the subscription when a network disconnection occurs', function () {
      room.subscribe();

      should(kuzzle.subscribe).be.calledOnce();
      kuzzle.subscribe.yield(null, result);

      should(room.roomId).be.exactly('foobar');
      should(room.channel).be.exactly('barfoo');
      kuzzle.emit('disconnected', new Error('foobar'));

      should(room.roomstate).be.eql('inactive');
    });

    it('should set the room in a deactivated state when the JWT expires', function () {
      room.subscribe();
      kuzzle.subscribe.yield(null, result);
      should(room.roomstate).be.eql('active');
      kuzzle.emit('tokenExpired');
      should(room.roomstate).be.eql('inactive');
    });

    it('should renew the subscription when the user is reconnected and the "autoResubscribe" option is set', function () {
      var subscribeSpy;

      room = new Room(collection, {equals: {foo: 'bar'}}, {autoResubscribe: true});
      subscribeSpy = sinon.spy(room, 'subscribe');

      room.subscribe();
      subscribeSpy.reset();
      kuzzle.subscribe.yield(null, result);
      should(room.roomstate).be.eql('active');

      kuzzle.emit('reconnected', {success: true});
      should(subscribeSpy).be.calledOnce();

      room = new Room(collection, {equals: {foo: 'bar'}}, {autoResubscribe: false});
      subscribeSpy = sinon.spy(room, 'subscribe');
      kuzzle.subscribe.yield(null, result);
      kuzzle.emit('reconnected', {success: true});
      should(subscribeSpy).not.be.called();
    });

    it('should reject the callback if the subscription fails', function (done) {
      room.onDone(function (err, res) {
        should(err).not.be.null();
        should(res).be.undefined();
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
      room.roomstate = 'active';
      room.notify = sinon.stub();
    });

    it('should forward the unsubscribe request to Kuzzle', function () {
      var
        opts = {foo: 'bar'},
        cb = sinon.stub();

      should(room.unsubscribe()).be.exactly(room);
      should(kuzzle.unsubscribe).be.calledOnce();
      should(kuzzle.unsubscribe).calledWith(room, undefined, undefined);
      should(room.roomstate).be.eql('inactive');

      room.roomstate = 'active';
      kuzzle.unsubscribe.reset();
      room.unsubscribe(cb);
      should(kuzzle.unsubscribe).be.calledOnce();
      should(kuzzle.unsubscribe).calledWith(room, null, cb);
      should(room.roomstate).be.eql('inactive');

      room.roomstate = 'active';
      kuzzle.unsubscribe.reset();
      room.unsubscribe(opts);
      should(kuzzle.unsubscribe).be.calledOnce();
      should(kuzzle.unsubscribe).calledWith(room, opts, undefined);
      should(room.roomstate).be.eql('inactive');

      room.roomstate = 'active';
      kuzzle.unsubscribe.reset();
      room.unsubscribe(opts, cb);
      should(kuzzle.unsubscribe).be.calledOnce();
      should(kuzzle.unsubscribe).calledWith(room, opts, cb);
      should(room.roomstate).be.eql('inactive');
    });

    it('should force-fail if the room is still subscribing', function () {
      var cb = sinon.stub();

      room.roomstate = 'subscribing';
      should(room.unsubscribe()).be.exactly(room);
      should(room.roomstate).be.eql('subscribing');
      should(kuzzle.unsubscribe).not.called();

      room.unsubscribe(cb);
      should(room.unsubscribe()).be.exactly(room);
      should(room.roomstate).be.eql('subscribing');
      should(kuzzle.unsubscribe).not.called();
      should(cb).calledOnce();
      should(cb.firstCall.args[0])
        .be.instanceof(Error)
        .and.match({message: 'Cannot unsubscribe a room while a subscription attempt is underway'});
    });

    it('should not send the unsubscribe request if the room is already inactive', function () {
      var cb = sinon.stub();

      room.roomstate = 'inactive';
      should(room.unsubscribe(cb)).be.exactly(room);
      should(kuzzle.unsubscribe).not.be.called();
      should(cb)
        .be.calledOnce()
        .and.calledWithMatch(null, room.roomId);
    });

    it('should remove active listeners, if any', function () {
      sinon.stub(kuzzle, 'removeListener');

      room.roomstate = 'active';
      room.isListening = false;
      room.unsubscribe();
      should(kuzzle.removeListener).not.be.called();

      room.roomstate = 'active';
      room.isListening = true;
      room.unsubscribe();
      should(kuzzle.removeListener).be.calledThrice();
      should(kuzzle.removeListener.firstCall.args).match(['disconnected', room.deactivate]);
      should(kuzzle.removeListener.secondCall.args).match(['tokenExpired', room.deactivate]);
      should(kuzzle.removeListener.thirdCall.args).match(['reconnected', room.resubscribeConditional]);
      should(room.isListening).be.false();
    });
  });
});
