var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Offline queue management', function () {
  let
    clock,
    now,
    reset;

  beforeEach(function () {
    let pastTime = 60050;

    const network = new NetworkWrapperMock({host: 'somewhere'});

    network.close = sinon.stub();
    kuzzle = new Kuzzle(network);

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
      kuzzle.offlineQueue.push({ts: now - pastTime, request: {requestId: pastTime, action: 'foo', controller: 'bar'}, cb: function () {}});
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
      kuzzle.queueTTL = 5000;
      kuzzle.addListener('offlineQueuePop', eventStub);

      kuzzle._cleanQueue();

      // should keep only the latest requests, dating from a few ms ago
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).be.above(now - kuzzle.queueTTL);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should ignore requests timestamps if queueTTL is 0', function () {
      var numRequests = kuzzle.offlineQueue.length;

      kuzzle.queueTTL = 0;
      kuzzle._cleanQueue();
      should(kuzzle.offlineQueue.length).be.exactly(numRequests);
    });

    it('should remove older requests until the queueMaxSize condition is met', function () {
      const
        lastRequest = kuzzle.offlineQueue[kuzzle.offlineQueue.length - 1],
        eventStub = sinon.stub();

      kuzzle.queueMaxSize = 1;
      kuzzle.addListener('offlineQueuePop', eventStub);
      kuzzle._cleanQueue();

      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0]).match(lastRequest);
      should(eventStub.callCount).be.exactly(6);
    });

    it('should not remove any request if queueMaxSize is 0', function () {
      const numRequests = kuzzle.offlineQueue.length;

      kuzzle.queueMaxSize = 0;
      kuzzle._cleanQueue();
      should(kuzzle.offlineQueue.length).be.exactly(numRequests);
    });
  });

  describe('#dequeue', function () {
    beforeEach(function () {
      kuzzle.network.query = sinon.stub().resolves();
      kuzzle.queuing = true;
    });

    it('should play all queued requests', function () {
      var
        numRequests = kuzzle.offlineQueue.length,
        eventStub = sinon.stub();

      kuzzle.addListener('offlineQueuePop', eventStub);
      kuzzle._dequeue();

      clock.tick(numRequests * kuzzle.replayInterval + 50);

      should(kuzzle.network.query.callCount).be.exactly(numRequests);
      should(kuzzle.offlineQueue).be.an.Array();
      should(kuzzle.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests);
    });

    it('should also load the queue provided by the offlineQueueLoader property', function () {
      const
        numRequests = kuzzle.offlineQueue.length,
        eventStub = sinon.stub();

      kuzzle.offlineQueueLoader = function () {
        return [
          {request: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {request: {requestId: 'foo2', action: 'action', controller: 'controller'}}
        ];
      };
      kuzzle.addListener('offlineQueuePop', eventStub);
      kuzzle._dequeue();

      clock.tick((numRequests + 2) * kuzzle.replayInterval + 50);

      should(kuzzle.network.query.callCount).be.exactly(numRequests + 2);
      should(kuzzle.offlineQueue).be.an.Array();
      should(kuzzle.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests + 2);
    });

    it('should filter duplicates from the offlineQueueLoader and the cached queue ', function () {
      const
        numRequests = kuzzle.offlineQueue.length,
        eventStub = sinon.stub();

      this.timeout(200);
      kuzzle.offlineQueueLoader = function () {
        return [
          {request: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {request: {requestId: '50050', action: 'action', controller: 'controller'}}
        ];
      };
      kuzzle.addListener('offlineQueuePop', eventStub);
      kuzzle._dequeue();

      clock.tick((numRequests + 1) * kuzzle.replayInterval + 50);

      should(kuzzle.network.query.callCount).be.exactly(numRequests + 1);
      should(kuzzle.offlineQueue).be.an.Array();
      should(kuzzle.offlineQueue.length).be.exactly(0);
      should(eventStub.callCount).be.exactly(numRequests + 1);
    });

    it('should throw on erroneous queries returned by the offlineQueueLoader property', function () {
      kuzzle.offlineQueueLoader = function () {
        return [
          {}
        ];
      };

      should(function () {kuzzle._dequeue();}).throw();
    });

    it('should throw if the offlineQueueLoader property is not a function', function () {
      kuzzle._offlineQueueLoader = 'foobar';
      should(function () {kuzzle._dequeue();}).throw();
    });

    it('should throw if the offlineQueueLoader function does not return an array', function () {
      kuzzle._offlineQueueLoader = function () {
        return false;
      };

      should(function () {kuzzle._dequeue();}).throw();
    });
  });

  describe('#flushQueue', function () {
    it('should return Kuzzle instance', () => {
      should(kuzzle.flushQueue()).be.exactly(kuzzle);
    });

    it('should empty the queue when asked to', () => {
      kuzzle._offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      kuzzle._offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      kuzzle._offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});
      kuzzle._offlineQueue.push({ts: 'foo', request: {}, cb: function () {}});

      kuzzle.flushQueue();
      should(kuzzle._offlineQueue.length).be.exactly(0);

    });
  });

  describe('#playQueue', function () {
    beforeEach(function () {
      kuzzle._dequeue = sinon.stub().resolves();
    });

    it('should return Kuzzle instance', () => {
      should(kuzzle.playQueue()).be.exactly(kuzzle);
    });

    it('should play the queue if the instance is connected', function () {
      kuzzle.network.isReady = sinon.stub().returns(true);
      kuzzle.playQueue();
      should(kuzzle._dequeue).be.calledOnce();
    });

    it('should not play the queue if the instance is offline', function () {
      kuzzle.network.isReady = sinon.stub().returns(false);
      kuzzle.playQueue();
      should(kuzzle._dequeue).not.be.called();
    });
  });

  describe('#startQueuing', function () {
    it('should return Kuzzle instance', () => {
      should(kuzzle.startQueuing()).be.exactly(kuzzle);
    });

    it('should set queuing property', function () {
      kuzzle.startQueuing();
      should(kuzzle.queuing).be.true();
    });
  });

  describe('#stopQueuing', function () {
    it('should return Kuzzle instance', () => {
      should(kuzzle.stopQueuing()).be.exactly(kuzzle);
    });

    it('should unset queuing property', function () {
      kuzzle.queuing = true;
      kuzzle.stopQueuing();
      should(kuzzle.queuing).be.false();
    });
  });
});
