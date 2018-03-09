var
  should = require('should'),
  sinon = require('sinon'),
  rewire = require('rewire'),
  AbstractWrapper = rewire('../../src/networkWrapper/protocols/abstract/common'),
  RTWrapper = rewire('../../src/networkWrapper/protocols/abstract/realtime');

describe('Network query management', function () {
  describe('#emitRequest', function () {
    var
      emitRequest = AbstractWrapper.__get__('emitRequest'),
      sendSpy,
      network;

    beforeEach(function () {
      network = new AbstractWrapper('somewhere');
      network.send = function(request) {
        network.emit(request.requestId, request.response);
      };
      sendSpy = sinon.spy(network, 'send');
    });

    it('should emit the request when asked to', function () {
      var request = {requestId: 'bar'};

      emitRequest(network, request);
      should(sendSpy).be.calledWith(request);
    });

    it('should trigger a "tokenExpired" event if the token has expired', function (done) {
      var
        eventStub = sinon.stub(),
        response = {
          error: {
            message: 'Token expired'
          }
        };

      network.addListener('tokenExpired', eventStub);

      emitRequest(network, {requestId: 'foobar', response: response}, function(error) {
        should(eventStub).be.calledOnce();
        should(error.message).be.exactly('Token expired');
        done();
      });
    });

    it('should fire a queryError if an error occurred', function (done) {
      var
        eventStub = sinon.stub(),
        response = {
          error: {
            message: 'foo-bar'
          }
        };

      network.addListener('queryError', eventStub);

      emitRequest(network, {requestId: 'bar', response: response}, function(error) {
        should(eventStub).be.calledOnce();
        should(error.message).be.exactly('foo-bar');
        done();
      });
    });

    it('should launch the callback once a response has been received', function (done) {
      var
        response = {result: 'foo', error: {foo: 'bar', message: 'foobar'}, status: 42},
        request = {requestId: 'someEvent', response: response},
        cb = function (err, res) {
          should(err).be.instanceOf(Error);
          should(err.message).be.exactly(response.error.message);
          should(err.stack).be.a.String();
          should(err.foo).be.exactly('bar');
          should(err.status).be.exactly(42);
          should(res).be.exactly(response);
          done();
        };

      emitRequest(network, request, cb);
    });
  });

  describe('#query', function () {
    var
      emitRequestRevert,
      emitRequestStub,
      queryBody = {
        controller: 'controller',
        action: 'action',
        collection: 'collection',
        index: 'index',
        body: {some: 'query'}
      };

    before(function () {
      emitRequestStub = sinon.stub();
      emitRequestRevert = AbstractWrapper.__set__('emitRequest', emitRequestStub);
    });

    after(function () {
      emitRequestRevert();
    });

    beforeEach(function () {
      network = new AbstractWrapper('somewhere');
      network.isReady = sinon.stub().returns(true);
      emitRequestStub.reset();
    });

    afterEach(function () {
      network.isReady.reset();
    });

    it('should exit early if the query is not queuable and the SDK is offline', function () {
      network.isReady.returns(false);
      network.query(queryBody, {queuable: false});
      should(emitRequestStub).not.be.called();
    });

    it('should emit the request directly without waiting the end of dequeuing if queuable is false', function () {
      network.query(queryBody, {queuable: false});
      should(emitRequestStub).be.calledOnce();
    });

    it('should queue the request during offline mode, if queuing has been activated', function () {
      var
        now = Date.now(),
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.isReady.returns(false);
      network.queuing = true;

      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(network.offlineQueue[0].query).match(queryBody);
      should(network.offlineQueue[0].cb).be.exactly(cb);
      should(queueStub).be.calledOnce();
    });

    it('should discard the request during offline mode if queuing is deactivated', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.isReady.returns(false);
      network.queuing = false;

      network.query(queryBody, {queuable: true}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue).be.empty();
      should(queueStub).not.be.called();
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.instanceof(Error);
      should(cb.firstCall.args[0].message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
    });

    it('should discard the request if not connected and if queuing is deactivated', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.isReady.returns(false);
      network.queuing = false;

      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue).be.empty();
      should(queueStub).not.be.called();
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.instanceof(Error);
      should(cb.firstCall.args[0].message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
    });

    it('should queue the request if a queue filter has been defined and if it allows queuing', function () {
      var
        now,
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.isReady.returns(false);
      network.queuing = true;
      network.queueFilter = function () { return true; };

      now = Date.now();
      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(network.offlineQueue[0].query).match(queryBody);
      should(network.offlineQueue[0].cb).be.exactly(cb);
      should(queueStub).be.calledOnce();
    });

    it('should discard the request if a queue filter has been defined and if it does not allows queuing', function () {
      var
        queueStub = sinon.stub(),
        cb = sinon.stub();

      network.addListener('offlineQueuePush', queueStub);
      network.isReady.returns(false);
      network.queuing = true;
      network.queueFilter = function () { return false; };

      network.query(queryBody, {}, cb);

      should(emitRequestStub).not.be.called();
      should(network.offlineQueue).be.empty();
      should(queueStub).not.be.called();
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.instanceof(Error);
      should(cb.firstCall.args[0].message).startWith('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request');
    });
  });

  describe('#subscribe', function() {
    var
      error,
      response,
      queryStub = function(queryArgs, query, options, cb) {
        if (!cb && typeof options === 'function') {
          cb = options;
          options = null;
        }
        if (cb && typeof cb === 'function') {
          cb(error, response);
        }
      };

    beforeEach(function () {
      network = new RTWrapper('somewhere');
      network.isReady = sinon.stub().returns(true);
      network.query = sinon.stub().callsFake(queryStub);
      error = null;
      response = {result: {channel: 'foobar', roomId: 'barfoo'}};
    });

    it('should throw an error if the protocol does not support realtime', function() {
      network = new AbstractWrapper('somewhere');

      should(() => network.subscribe({}, {}, sinon.stub(), sinon.stub())).throw('Not Implemented');
      should(network.query).not.be.called();
    });

    it('should throw an error if not connected', function() {
      var cb = sinon.stub();

      network.isReady.returns(false);
      network.subscribe({}, {}, sinon.stub(), cb);
      should(cb).be.calledOnce();
      should(cb.firstCall.args[0]).be.an.instanceOf(Error);
      should(cb.firstCall.args[0].message).be.eql('Not Connected');
      should(network.query).not.be.called();
    });

    it('should call query method with good arguments', function() {
      var
        notificationCB = sinon.stub(),
        cb = sinon.stub();

      network.subscribe({foo: 'bar'}, {bar: 'foo'}, notificationCB, cb);
      should(network.query)
        .be.calledOnce()
        .be.calledWith({foo: 'bar'}, {bar: 'foo'});
    });

    it('should launch the callback with an error in case of error', function() {
      var
        notificationCB = sinon.stub(),
        cb = sinon.stub();

      error = new Error('foobar');
      network.subscribe({foo: 'bar'}, {bar: 'foo'}, notificationCB, cb);

      should(cb)
        .be.calledOnce()
        .be.calledWith(error);
    });

    it('should launch the callback with the query result if OK', function() {
      var
        notificationCB = sinon.stub(),
        cb = sinon.stub();

      network.subscribe({foo: 'bar'}, {bar: 'foo'}, notificationCB, cb);

      should(cb)
        .be.calledOnce()
        .be.calledWith(null, {channel: 'foobar', roomId: 'barfoo'});
    });

    it('should listen to the channel when the subscription is sucessully created', function() {
      var
        notificationCB = sinon.stub(),
        cb = sinon.stub();

      network.subscribe({foo: 'bar'}, {bar: 'foo'}, notificationCB, cb);

      network.emit('foobar', {type: 'document', result: {}, action: 'foo'});

      should(notificationCB)
        .be.calledOnce()
        .be.calledWithMatch({type: 'document', result: {}, action: 'foo'});
    });

    it('should add "fromSelf" property to the result from history if emitted by this instance', function () {
      var
        notificationCB = sinon.stub(),
        cb = sinon.stub();

      network.subscribe({foo: 'bar'}, {bar: 'foo'}, notificationCB, cb);
      network.emit('foobar', {type: 'document', result: {}, action: 'foo', volatile: {sdkInstanceId: network.id}});

      should(notificationCB)
        .be.calledOnce()
        .be.calledWithMatch({fromSelf: true});

      notificationCB.reset();
      network.emit('foobar', {type: 'document', result: {}, action: 'foo', volatile: {sdkInstanceId: 'foobar'}});

      should(notificationCB)
        .be.calledOnce()
        .be.calledWithMatch({fromSelf: false});

      notificationCB.reset();
      network.emit('foobar', {type: 'document', result: {}, action: 'foo'});

      should(notificationCB)
        .be.calledOnce()
        .be.calledWithMatch({fromSelf: false});
    });
  });

  describe('#unsubscribe', function() {
    var
      error,
      response,
      queryStub = function(queryArgs, query, options, cb) {
        if (!cb && typeof options === 'function') {
          cb = options;
          options = null;
        }
        if (cb && typeof cb === 'function') {
          cb(error, response);
        }
      };

    beforeEach(function () {
      network = new RTWrapper('somewhere');
      network.isReady = sinon.stub().returns(true);
      network.query = sinon.stub().callsFake(queryStub);
      error = null;
      response = {result: {roomId: 'foobar'}};
    });

    it('should throw an error if the protocol does not support realtime', function() {
      network = new AbstractWrapper('somewhere');

      should(() => network.unsubscribe({foo: 'bar'}, {bar: 'foo'}, 'channel', sinon.stub())).throw('Not Implemented');
      should(network.query).not.be.called();
    });

    it('should call query method with good arguments', function() {
      var
        cb = sinon.stub();

      network.unsubscribe({foo: 'bar'}, 'channel', cb);
      should(network.query)
        .be.calledOnce()
        .be.calledWith({foo: 'bar'}, null);
    });

    it('should launch the callback with an error in case of error', function() {
      var
        cb = sinon.stub();

      error = new Error('foobar');
      network.unsubscribe({foo: 'bar'}, 'channel', cb);

      should(cb)
        .be.calledOnce()
        .be.calledWith(error);
    });

    it('should launch the callback with the query result if OK', function() {
      var
        cb = sinon.stub();

      network.unsubscribe({foo: 'bar'}, 'channel', cb);

      should(cb)
        .be.calledOnce()
        .be.calledWith(null, {roomId: 'foobar'});
    });

    it('should stop listening to the channel', function() {
      var
        notificationCB = sinon.stub(),
        cb = sinon.stub();

      network.on('channel', notificationCB);
      network.on('channel', sinon.stub());
      should(network.listeners('channel').length).be.eql(2);

      network.emit('channel', {type: 'document', result: {}, action: 'foo'});
      should(notificationCB).be.calledOnce();

      notificationCB.reset();
      network.unsubscribe({foo: 'bar'}, 'channel', cb);
      should(network.listeners('channel')).be.empty();

      network.emit('channel', {type: 'document', result: {}, action: 'foo'});
      should(notificationCB).not.be.called();
    });
  });
});
