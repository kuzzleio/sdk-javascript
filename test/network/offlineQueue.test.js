var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  AbstractWrapper = rewire('../../src/networkWrapper/protocols/abstract/common');

describe('Offline queue management', function () {
  var
    clock,
    now,
    network,
    reset;

  beforeEach(function () {
    var pastTime = 60050;

    network = new AbstractWrapper('somewhere');

    // queuing a bunch of 7 requests from 1min ago to right now, 10s apart
    now = Date.now();
    clock = sinon.useFakeTimers(now);

    reset = AbstractWrapper.__set__({
      setTimeout: clock.setTimeout,
      setInterval: clock.setInterval,
      clearTimeout: clock.clearTimeout,
      clearInterval: clock.clearInterval
    });

    while (pastTime >= 0) {
      network.offlineQueue.push({ts: now - pastTime, query: {requestId: pastTime, action: 'foo', controller: 'bar'}, cb: function () {}});
      pastTime -= 10000;
    }
  });

  afterEach(function () {
    clock.restore();
    reset();
  });

  describe('#cleanQueue', function () {
    var
      cleanQueue = AbstractWrapper.__get__('cleanQueue');

    it('should remove outdated queued requests', function () {
      var eventStub = sinon.stub();

      // setting the request TTL to 5s
      network.queueTTL = 5000;
      network.addListener('offlineQueuePop', eventStub);

      cleanQueue(network);

      // should keep only the latest requests, dating from a few ms ago
      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0].ts).be.above(now - network.queueTTL);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should ignore requests timestamps if queueTTL is 0', function () {
      var numRequests = network.offlineQueue.length;

      network.queueTTL = 0;
      cleanQueue(network);
      should(network.offlineQueue.length).be.exactly(numRequests);
    });

    it('should remove older requests until the queueMaxSize condition is met', function () {
      var
        lastRequest = network.offlineQueue[network.offlineQueue.length - 1],
        eventStub = sinon.stub();

      network.queueMaxSize = 1;
      network.addListener('offlineQueuePop', eventStub);
      cleanQueue(network);

      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0]).match(lastRequest);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should not remove any request if queueMaxSize is 0', function () {
      var numRequests = network.offlineQueue.length;

      network.queueMaxSize = 0;
      cleanQueue(network);
      should(network.offlineQueue.length).be.exactly(numRequests);
    });
  });

  describe('#dequeue', function () {
    var
      emitRequestRevert,
      emitRequestStub,
      dequeue = AbstractWrapper.__get__('dequeue');

    before(function () {
      emitRequestStub = sinon.stub();
      emitRequestRevert = AbstractWrapper.__set__('emitRequest', emitRequestStub);
    });

    after(function () {
      emitRequestRevert();
    });

    beforeEach(function () {
      network.queuing = true;
      emitRequestStub.reset();
    });

    it('should play all queued requests', function () {
      var
        numRequests = network.offlineQueue.length,
        eventStub = sinon.stub();

      network.addListener('offlineQueuePop', eventStub);
      dequeue(network);

      clock.tick(numRequests * network.replayInterval + 50);

      should(emitRequestStub.callCount).be.exactly(numRequests);
      should(network.offlineQueue).be.an.Array();
      should(network.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests);
    });

    it('should also load the queue provided by the offlineQueueLoader property', function () {
      var
        numRequests = network.offlineQueue.length,
        eventStub = sinon.stub();

      network.offlineQueueLoader = function () {
        return [
          {query: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {query: {requestId: 'foo2', action: 'action', controller: 'controller'}}
        ];
      };
      network.addListener('offlineQueuePop', eventStub);
      dequeue(network);

      clock.tick((numRequests + 2) * network.replayInterval + 50);

      should(emitRequestStub.callCount).be.exactly(numRequests + 2);
      should(network.offlineQueue).be.an.Array();
      should(network.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests + 2);
    });

    it('should filter duplicates from the offlineQueueLoader and the cached queue ', function () {
      var
        numRequests = network.offlineQueue.length,
        eventStub = sinon.stub();

      this.timeout(200);
      network.offlineQueueLoader = function () {
        return [
          {query: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {query: {requestId: '50050', action: 'action', controller: 'controller'}}
        ];
      };
      network.addListener('offlineQueuePop', eventStub);
      dequeue(network);

      clock.tick((numRequests + 1) * network.replayInterval + 50);

      should(emitRequestStub.callCount).be.exactly(numRequests + 1);
      should(network.offlineQueue).be.an.Array();
      should(network.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests + 1);
    });

    it('should throw on erroneous queries returned by the offlineQueueLoader property', function () {
      network.offlineQueueLoader = function () {
        return [
          {}
        ];
      };

      should(function () {dequeue(network);}).throw();
    });

    it('should throw if the offlineQueueLoader property is not a function', function () {
      network.offlineQueueLoader = 'foobar';
      should(function () {dequeue(network);}).throw();
    });

    it('should throw if the offlineQueueLoader function does not return an array', function () {
      network.offlineQueueLoader = function () {
        return false;
      };

      should(function () {dequeue(network);}).throw();
    });
  });

  describe('#flushQueue', function () {
    it('should empty the queue when asked to', function () {
      network.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      network.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      network.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      network.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});

      network.flushQueue();
      should(network.offlineQueue.length).be.exactly(0);
    });
  });

  describe('#playQueue', function () {
    var
      dequeueStub,
      dequeueRevert;

    before(function () {
      dequeueStub = sinon.stub();
      dequeueRevert = AbstractWrapper.__set__('dequeue', dequeueStub);
    });

    after(function () {
      dequeueRevert();
    });

    beforeEach(function () {
      dequeueStub.reset();
    });

    it('should play the queue if the instance is connected', function () {
      network.state = 'connected';
      network.playQueue();
      should(dequeueStub).be.calledOnce();
    });

    it('should not play the queue if the instance is offline', function () {
      network.state = 'offline';
      network.playQueue();
      should(dequeueStub).not.be.called();
    });

    it('should not play the queue if the instance is still connecting', function () {
      network.state = 'connecting';
      network.playQueue();
      should(dequeueStub).not.be.called();
    });
  });

  describe('#startQueuing', function () {
    it('should set queuing property', function () {
      network.startQueuing();
      should(network.queuing).be.true();
    });
  });

  describe('#stopQueuing', function () {
    it('should unset queuing property', function () {
      network.queuing = true;
      network.stopQueuing();
      should(network.queuing).be.false();
    });
  });
});
