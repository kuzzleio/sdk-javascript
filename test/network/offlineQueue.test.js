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
      network.offlineQueue.push({ts: now - pastTime, request: {requestId: pastTime, action: 'foo', controller: 'bar'}, cb: function () {}});
      pastTime -= 10000;
    }
  });

  afterEach(function () {
    clock.restore();
    reset();
  });

  describe('#cleanQueue', function () {

    it('should remove outdated queued requests', function () {
      var eventStub = sinon.stub();

      // setting the request TTL to 5s
      network.queueTTL = 5000;
      network.addListener('offlineQueuePop', eventStub);

      network._cleanQueue();

      // should keep only the latest requests, dating from a few ms ago
      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0].ts).be.above(now - network.queueTTL);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should ignore requests timestamps if queueTTL is 0', function () {
      var numRequests = network.offlineQueue.length;

      network.queueTTL = 0;
      network._cleanQueue();
      should(network.offlineQueue.length).be.exactly(numRequests);
    });

    it('should remove older requests until the queueMaxSize condition is met', function () {
      var
        lastRequest = network.offlineQueue[network.offlineQueue.length - 1],
        eventStub = sinon.stub();

      network.queueMaxSize = 1;
      network.addListener('offlineQueuePop', eventStub);
      network._cleanQueue();

      should(network.offlineQueue.length).be.exactly(1);
      should(network.offlineQueue[0]).match(lastRequest);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should not remove any request if queueMaxSize is 0', function () {
      var numRequests = network.offlineQueue.length;

      network.queueMaxSize = 0;
      network._cleanQueue();
      should(network.offlineQueue.length).be.exactly(numRequests);
    });
  });

  describe('#dequeue', function () {
    beforeEach(function () {
      network._emitRequest = sinon.stub().resolves();
      network.queuing = true;
    });

    it('should play all queued requests', function () {
      var
        numRequests = network.offlineQueue.length,
        eventStub = sinon.stub();

      network.addListener('offlineQueuePop', eventStub);
      network._dequeue();

      clock.tick(numRequests * network.replayInterval + 50);

      should(network._emitRequest.callCount).be.exactly(numRequests);
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
          {request: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {request: {requestId: 'foo2', action: 'action', controller: 'controller'}}
        ];
      };
      network.addListener('offlineQueuePop', eventStub);
      network._dequeue();

      clock.tick((numRequests + 2) * network.replayInterval + 50);

      should(network._emitRequest.callCount).be.exactly(numRequests + 2);
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
          {request: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {request: {requestId: '50050', action: 'action', controller: 'controller'}}
        ];
      };
      network.addListener('offlineQueuePop', eventStub);
      network._dequeue();

      clock.tick((numRequests + 1) * network.replayInterval + 50);

      should(network._emitRequest.callCount).be.exactly(numRequests + 1);
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

      should(function () {network._dequeue();}).throw();
    });

    it('should throw if the offlineQueueLoader property is not a function', function () {
      network.offlineQueueLoader = 'foobar';
      should(function () {network._dequeue();}).throw();
    });

    it('should throw if the offlineQueueLoader function does not return an array', function () {
      network.offlineQueueLoader = function () {
        return false;
      };

      should(function () {network._dequeue();}).throw();
    });
  });

  describe('#flushQueue', function () {
    it('should empty the queue when asked to', function () {
      network.offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      network.offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      network.offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      network.offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});

      network.flushQueue();
      should(network.offlineQueue.length).be.exactly(0);
    });
  });

  describe('#playQueue', function () {
    beforeEach(function () {
      network._dequeue = sinon.stub().resolves();
    });

    it('should play the queue if the instance is connected', function () {
      network.isReady = sinon.stub().returns(true);
      network.playQueue();
      should(network._dequeue).be.calledOnce();
    });

    it('should not play the queue if the instance is offline', function () {
      network.isReady = sinon.stub().returns(false);
      network.playQueue();
      should(network._dequeue).not.be.called();
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
