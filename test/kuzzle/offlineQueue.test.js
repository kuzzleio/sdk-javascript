var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Offline queue management', function () {
  var
    clock,
    now,
    kuzzle,
    reset;

  beforeEach(function () {
    var pastTime = 60050;

    kuzzle = new Kuzzle('foo', {connect: 'manual'});

    // queuing a bunch of 7 requests from 1min ago to right now, 10s apart
    now = Date.now();
    clock = sinon.useFakeTimers(now);

    reset = Kuzzle.__set__({
      setTimeout: clock.setTimeout,
      setInterval: clock.setInterval,
      clearTimeout: clock.clearTimeout,
      clearInterval: clock.clearInterval
    });

    while (pastTime >= 0) {
      kuzzle.offlineQueue.push({ts: now - pastTime, query: {requestId: pastTime, action: 'foo', controller: 'bar'}, cb: function () {}});
      pastTime -= 10000;
    }
  });

  afterEach(function () {
    clock.restore();
    reset();
  });

  describe('#cleanQueue', function () {
    var
      cleanQueue = Kuzzle.__get__('cleanQueue');

    it('should remove outdated queued requests', function () {
      var eventStub = sinon.stub();

      // setting the request TTL to 5s
      kuzzle.queueTTL = 5000;
      kuzzle.addListener('offlineQueuePop', eventStub);

      cleanQueue.call(kuzzle);

      // should keep only the latest requests, dating from a few ms ago
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).be.above(now - kuzzle.queueTTL);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should ignore requests timestamps if queueTTL is 0', function () {
      var numRequests = kuzzle.offlineQueue.length;

      kuzzle.queueTTL = 0;
      cleanQueue.call(kuzzle);
      should(kuzzle.offlineQueue.length).be.exactly(numRequests);
    });

    it('should remove older requests until the queueMaxSize condition is met', function () {
      var
        lastRequest = kuzzle.offlineQueue[kuzzle.offlineQueue.length - 1],
        eventStub = sinon.stub();

      kuzzle.queueMaxSize = 1;
      kuzzle.addListener('offlineQueuePop', eventStub);
      cleanQueue.call(kuzzle);

      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0]).match(lastRequest);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should not remove any request if queueMaxSize is 0', function () {
      var numRequests = kuzzle.offlineQueue.length;

      kuzzle.queueMaxSize = 0;
      cleanQueue.call(kuzzle);
      should(kuzzle.offlineQueue.length).be.exactly(numRequests);
    });
  });

  describe('#dequeuing', function () {
    var
      emitRequestRevert,
      emitRequestStub,
      dequeue = Kuzzle.__get__('dequeue');

    before(function () {
      emitRequestStub = sinon.stub();
      emitRequestRevert = Kuzzle.__set__('emitRequest', emitRequestStub);
    });

    after(function () {
      emitRequestRevert();
    });

    beforeEach(function () {
      kuzzle.queuing = true;
      emitRequestStub.reset();
    });

    it('should play all queued requests', function () {
      var
        numRequests = kuzzle.offlineQueue.length,
        eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePop', eventStub);
      dequeue.call(kuzzle);

      clock.tick(numRequests * kuzzle.replayInterval + 50);

      should(emitRequestStub.callCount).be.exactly(numRequests);
      should(kuzzle.offlineQueue).be.an.Array();
      should(kuzzle.offlineQueue.length).be.exactly(0);
      should(kuzzle.queuing).be.false();
      should(eventStub.callCount).be.exactly(numRequests);
    });

    it('should also load the queue provided by the offlineQueueLoader property', function () {
      var
        numRequests = kuzzle.offlineQueue.length,
        eventStub = sinon.stub();

      kuzzle.offlineQueueLoader = function () {
        return [
          {query: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {query: {requestId: 'foo2', action: 'action', controller: 'controller'}}
        ];
      };
      kuzzle.addListener('offlineQueuePop', eventStub);
      dequeue.call(kuzzle);

      clock.tick((numRequests + 2) * kuzzle.replayInterval + 50);

      should(emitRequestStub.callCount).be.exactly(numRequests + 2);
      should(kuzzle.offlineQueue).be.an.Array();
      should(kuzzle.offlineQueue.length).be.exactly(0);
      should(kuzzle.queuing).be.false();
      should(eventStub.callCount).be.exactly(numRequests + 2);
    });

    it('should filter duplicates from the offlineQueueLoader and the cached queue ', function () {
      var
        numRequests = kuzzle.offlineQueue.length,
        eventStub = sinon.stub();

      this.timeout(200);
      kuzzle.offlineQueueLoader = function () {
        return [
          {query: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {query: {requestId: '50050', action: 'action', controller: 'controller'}}
        ];
      };
      kuzzle.addListener('offlineQueuePop', eventStub);
      dequeue.call(kuzzle);

      clock.tick((numRequests + 1) * kuzzle.replayInterval + 50);

      should(emitRequestStub.callCount).be.exactly(numRequests + 1);
      should(kuzzle.offlineQueue).be.an.Array();
      should(kuzzle.offlineQueue.length).be.exactly(0);
      should(kuzzle.queuing).be.false();
      should(eventStub.callCount).be.exactly(numRequests + 1);
    });

    it('should throw on erroneous queries returned by the offlineQueueLoader property', function () {
      kuzzle.offlineQueueLoader = function () {
        return [
          {}
        ];
      };

      should(function () {dequeue.call(kuzzle);}).throw();
    });

    it('should throw if the offlineQueueLoader property is not a function', function () {
      kuzzle.offlineQueueLoader = 'foobar';
      should(function () {dequeue.call(kuzzle);}).throw();
    });

    it('should throw if the offlineQueueLoader function does not return an array', function () {
      kuzzle.offlineQueueLoader = function () {
        return false;
      };

      should(function () {dequeue.call(kuzzle);}).throw();
    });
  });

  describe('#flushing the queue', function () {
    it('should empty the queue when asked to', function () {
      kuzzle.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      kuzzle.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      kuzzle.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      kuzzle.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});

      kuzzle.flushQueue();
      should(kuzzle.offlineQueue.length).be.exactly(0);
    });
  });

  describe('#replayQueue', function () {
    var
      dequeueStub,
      dequeueRevert;

    before(function () {
      dequeueStub = sinon.stub();
      dequeueRevert = Kuzzle.__set__('dequeue', dequeueStub);
    });

    after(function () {
      dequeueRevert();
    });

    beforeEach(function () {
      dequeueStub.reset();
    });

    it('should replay the queue if autoReplay is off and the instance is connected', function () {
      kuzzle.state = 'connected';
      kuzzle.replayQueue();
      should(dequeueStub).be.calledOnce();
    });

    it('should not replay the queue if the connection is offline', function () {
      kuzzle.state = 'offline';
      kuzzle.replayQueue();
      should(dequeueStub).not.be.called();
    });

    it('should not replay the queue if autoReplay is on', function () {
      kuzzle.autoReplay = true;
      kuzzle.state = 'connected';
      kuzzle.replayQueue();
      should(dequeueStub).not.be.called();
    });
  });

  describe('#startQueuing', function () {
    it('should not start queuing if the instance is connected', function () {
      kuzzle.state = 'connected';
      kuzzle.startQueuing();
      should(kuzzle.queuing).be.false();
    });

    it('should not start queuing if autoQueue is on', function () {
      kuzzle.autoQueue = true;
      kuzzle.state = 'offline';
      kuzzle.startQueuing();
      should(kuzzle.queuing).be.false();
    });

    it('should start queing if autoQueue is off and the instance is disconnected', function () {
      kuzzle.state = 'offline';
      kuzzle.startQueuing();
      should(kuzzle.queuing).be.true();
    });
  });

  describe('#stopQueuing', function () {
    it('should not stop queuing if the instance is connected', function () {
      kuzzle.state = 'connected';
      kuzzle.queuing = true;
      kuzzle.stopQueuing();
      should(kuzzle.queuing).be.true();
    });

    it('should not stop queuing if autoQueue is on', function () {
      kuzzle.autoQueue = true;
      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.stopQueuing();
      should(kuzzle.queuing).be.true();
    });

    it('should stop queuing if autoQueue is off and the instance is offline', function () {
      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.stopQueuing();
      should(kuzzle.queuing).be.false();
    });
  });
});
