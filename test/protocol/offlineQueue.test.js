var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  AbstractWrapper = rewire('../../src/protocols/abstract/common');

describe('Offline queue management', function () {
  var
    clock,
    now,
    protocol,
    reset;

  beforeEach(function () {
    var pastTime = 60050;

    protocol = new AbstractWrapper();

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
      protocol.offlineQueue.push({ts: now - pastTime, request: {requestId: pastTime, action: 'foo', controller: 'bar'}, cb: function () {}});
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
      protocol.queueTTL = 5000;
      protocol.addListener('offlineQueuePop', eventStub);

      protocol._cleanQueue();

      // should keep only the latest requests, dating from a few ms ago
      should(protocol.offlineQueue.length).be.exactly(1);
      should(protocol.offlineQueue[0].ts).be.above(now - protocol.queueTTL);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should ignore requests timestamps if queueTTL is 0', function () {
      var numRequests = protocol.offlineQueue.length;

      protocol.queueTTL = 0;
      protocol._cleanQueue();
      should(protocol.offlineQueue.length).be.exactly(numRequests);
    });

    it('should remove older requests until the queueMaxSize condition is met', function () {
      var
        lastRequest = protocol.offlineQueue[protocol.offlineQueue.length - 1],
        eventStub = sinon.stub();

      protocol.queueMaxSize = 1;
      protocol.addListener('offlineQueuePop', eventStub);
      protocol._cleanQueue();

      should(protocol.offlineQueue.length).be.exactly(1);
      should(protocol.offlineQueue[0]).match(lastRequest);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should not remove any request if queueMaxSize is 0', function () {
      var numRequests = protocol.offlineQueue.length;

      protocol.queueMaxSize = 0;
      protocol._cleanQueue();
      should(protocol.offlineQueue.length).be.exactly(numRequests);
    });
  });

  describe('#dequeue', function () {
    beforeEach(function () {
      protocol._emitRequest = sinon.stub().resolves();
      protocol.queuing = true;
    });

    it('should play all queued requests', function () {
      var
        numRequests = protocol.offlineQueue.length,
        eventStub = sinon.stub();

      protocol.addListener('offlineQueuePop', eventStub);
      protocol._dequeue();

      clock.tick(numRequests * protocol.replayInterval + 50);

      should(protocol._emitRequest.callCount).be.exactly(numRequests);
      should(protocol.offlineQueue).be.an.Array();
      should(protocol.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests);
    });

    it('should also load the queue provided by the offlineQueueLoader property', function () {
      var
        numRequests = protocol.offlineQueue.length,
        eventStub = sinon.stub();

      protocol.offlineQueueLoader = function () {
        return [
          {request: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {request: {requestId: 'foo2', action: 'action', controller: 'controller'}}
        ];
      };
      protocol.addListener('offlineQueuePop', eventStub);
      protocol._dequeue();

      clock.tick((numRequests + 2) * protocol.replayInterval + 50);

      should(protocol._emitRequest.callCount).be.exactly(numRequests + 2);
      should(protocol.offlineQueue).be.an.Array();
      should(protocol.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests + 2);
    });

    it('should filter duplicates from the offlineQueueLoader and the cached queue ', function () {
      var
        numRequests = protocol.offlineQueue.length,
        eventStub = sinon.stub();

      this.timeout(200);
      protocol.offlineQueueLoader = function () {
        return [
          {request: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {request: {requestId: '50050', action: 'action', controller: 'controller'}}
        ];
      };
      protocol.addListener('offlineQueuePop', eventStub);
      protocol._dequeue();

      clock.tick((numRequests + 1) * protocol.replayInterval + 50);

      should(protocol._emitRequest.callCount).be.exactly(numRequests + 1);
      should(protocol.offlineQueue).be.an.Array();
      should(protocol.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests + 1);
    });

    it('should throw on erroneous queries returned by the offlineQueueLoader property', function () {
      protocol.offlineQueueLoader = function () {
        return [
          {}
        ];
      };

      should(function () {protocol._dequeue();}).throw();
    });

    it('should throw if the offlineQueueLoader property is not a function', function () {
      protocol.offlineQueueLoader = 'foobar';
      should(function () {protocol._dequeue();}).throw();
    });

    it('should throw if the offlineQueueLoader function does not return an array', function () {
      protocol.offlineQueueLoader = function () {
        return false;
      };

      should(function () {protocol._dequeue();}).throw();
    });
  });

  describe('#flushQueue', function () {
    it('should empty the queue when asked to', function () {
      protocol.offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      protocol.offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      protocol.offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      protocol.offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});

      protocol.flushQueue();
      should(protocol.offlineQueue.length).be.exactly(0);
    });
  });

  describe('#playQueue', function () {
    beforeEach(function () {
      protocol._dequeue = sinon.stub().resolves();
    });

    it('should play the queue if the instance is connected', function () {
      protocol.isReady = sinon.stub().returns(true);
      protocol.playQueue();
      should(protocol._dequeue).be.calledOnce();
    });

    it('should not play the queue if the instance is offline', function () {
      protocol.isReady = sinon.stub().returns(false);
      protocol.playQueue();
      should(protocol._dequeue).not.be.called();
    });
  });

  describe('#startQueuing', function () {
    it('should set queuing property', function () {
      protocol.startQueuing();
      should(protocol.queuing).be.true();
    });
  });

  describe('#stopQueuing', function () {
    it('should unset queuing property', function () {
      protocol.queuing = true;
      protocol.stopQueuing();
      should(protocol.queuing).be.false();
    });
  });
});
