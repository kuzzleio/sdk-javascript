var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle');

describe('Offline queue management', () => {
  var sent;

  // deactivate socket.io
  before(function () {
    Kuzzle.__set__('io', function () {
      return {
        emit: function () { sent++; },
        close: function () {},
        on: function () {},
        once: function () {}
      };
    });
  });

  describe('#cleanQueue', function () {
    var
      cleanQueue = Kuzzle.__get__('cleanQueue'),
      now,
      kuzzle;

    beforeEach(function () {
      var pastTime = 60000;
      
      kuzzle = new Kuzzle('foo');

      // queuing a bunch of requests from 1min ago to right now, 10s apart
      now = Date.now();

      while (pastTime >= 0) {
        kuzzle.offlineQueue.push({ts: now - pastTime, query: {}, cb: function () {}});
        pastTime -= 10000;
      }
    });

    it('should remove outdated queued requests', function (done) {
      var eventFired = false;

      // setting the request TTL to 5s
      kuzzle.queueTTL = 5000;
      kuzzle.addListener('offlineQueuePop', () => eventFired = true);

      cleanQueue.call(kuzzle);

      // should keep only the latest requests, dating from a few ms ago
      setTimeout(() => {
        should(kuzzle.offlineQueue.length).be.exactly(1);
        should(kuzzle.offlineQueue[0].ts).be.above(now - kuzzle.queueTTL);
        should(eventFired).be.true();
        done();
      }, 50);
    });

    it('should ignore requests timestamps if queueTTL is 0', function () {
      var numRequests = kuzzle.offlineQueue.length;

      kuzzle.queueTTL = 0;
      cleanQueue.call(kuzzle);
      should(kuzzle.offlineQueue.length).be.exactly(numRequests);
    });

    it('should remove older requests until the queueMaxSize condition is met', function (done) {
      var
        lastRequest = kuzzle.offlineQueue[kuzzle.offlineQueue.length - 1],
        eventFired = false;

      kuzzle.queueMaxSize = 1;
      kuzzle.addListener('offlineQueuePop', () => eventFired = true);
      cleanQueue.call(kuzzle);

      process.nextTick(() => {
        should(kuzzle.offlineQueue.length).be.exactly(1);
        should(kuzzle.offlineQueue[0]).match(lastRequest);
        should(eventFired).be.true();
        done();
      });
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
      dequeue = Kuzzle.__get__('dequeue'),
      now = Date.now(),
      kuzzle;

    beforeEach(function () {
      var
        pastTime = 60000;

      sent = 0;
      kuzzle = new Kuzzle('foo');
      kuzzle.socket = { emit: () => { sent++; } };
      kuzzle.queuing = true;

      // queuing a bunch of requests from 1min ago to right now, 10s apart
      while (pastTime >= 0) {
        kuzzle.offlineQueue.push({ts: now - pastTime, query: {requestId: pastTime, action: 'foo', controller: 'bar'}});
        pastTime -= 10000;
      }
    });

    it('should play all queued requests', function (done) {
      var
        numRequests = kuzzle.offlineQueue.length,
        eventFired = 0;

      this.timeout(200);
      kuzzle.addListener('offlineQueuePop', () => eventFired++);
      dequeue.call(kuzzle);

      setTimeout(() => {
        should(sent).be.exactly(numRequests);
        should(kuzzle.offlineQueue).be.an.Array();
        should(kuzzle.offlineQueue.length).be.exactly(0);
        should(kuzzle.queuing).be.false();
        should(eventFired).be.eql(numRequests);
        done();
      }, numRequests * kuzzle.replayInterval + 50);
    });

    it('should also load the queue provided by the offlineQueueLoader property', function (done) {
      var
        numRequests = kuzzle.offlineQueue.length,
        eventFired = 0;

      this.timeout(200);
      kuzzle.offlineQueueLoader = function () {
        return [
            {query: {requestId: 'foo', action: 'action', controller: 'controller'}},
            {query: {requestId: 'foo2', action: 'action', controller: 'controller'}}
          ];
      };
      kuzzle.addListener('offlineQueuePop', () => eventFired++);
      dequeue.call(kuzzle);

      setTimeout(() => {
        should(sent).be.exactly(numRequests + 2);
        should(kuzzle.offlineQueue).be.an.Array();
        should(kuzzle.offlineQueue.length).be.exactly(0);
        should(kuzzle.queuing).be.false();
        should(eventFired).be.eql(numRequests + 2);
        done();
      }, (numRequests +2) * kuzzle.replayInterval + 50);
    });

    it('should filter duplicates from the offlineQueueLoader and the cached queue ', function (done) {
      var
        numRequests = kuzzle.offlineQueue.length,
        eventFired = 0;

      this.timeout(200);
      kuzzle.offlineQueueLoader = function () {
        return [
          {query: {requestId: 'foo', action: 'action', controller: 'controller'}},
          {query: {requestId: '50000', action: 'action', controller: 'controller'}}
        ];
      };
      kuzzle.addListener('offlineQueuePop', () => eventFired++);
      dequeue.call(kuzzle);

      setTimeout(() => {
        should(sent).be.exactly(numRequests + 1);
        should(kuzzle.offlineQueue).be.an.Array();
        should(kuzzle.offlineQueue.length).be.exactly(0);
        should(kuzzle.queuing).be.false();
        should(eventFired).be.eql(numRequests + 1);
        done();
      }, (numRequests + 1) * kuzzle.replayInterval + 50);
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
    it ('should empty the queue when asked to', function () {
      var kuzzle = new Kuzzle('foo');

      kuzzle.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      kuzzle.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      kuzzle.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});
      kuzzle.offlineQueue.push({ts: 'foo', query: {}, cb: function () {}});

      kuzzle.flushQueue();
      should(kuzzle.offlineQueue.length).be.exactly(0);
    });
  });

  describe('#replayQueue', function () {
    it('should not replay the queue if the connection is offline', function () {
      var replayed = false;

      Kuzzle.__with__({
        dequeue: function () { replayed = true; }
      })(function () {
        var kuzzle = new Kuzzle('foo');

        kuzzle.state = 'offline';
        kuzzle.replayQueue();
        should(replayed).false();
      });
    });

    it('should not replay the queue if autoReplay is on', function () {
      var replayed = false;

      Kuzzle.__with__({
        dequeue: function () { replayed = true; }
      })(function () {
        var kuzzle = new Kuzzle('foo', {autoReplay: true});

        kuzzle.state = 'connected';
        kuzzle.replayQueue();
        should(replayed).false();
      });
    });

    it('should replay the queue if autoReplay is off and the instance is connected', function () {
      var replayed = false;

      Kuzzle.__with__({
        dequeue: function () { replayed = true; }
      })(function () {
        var kuzzle = new Kuzzle('foo');

        kuzzle.state = 'connected';
        kuzzle.replayQueue();
        should(replayed).true();
      });
    });
  });

  describe('#startQueuing', function () {
    it('should not start queuing if the instance is connected', function () {
      var kuzzle = new Kuzzle('foo');

      kuzzle.state = 'connected';
      kuzzle.startQueuing();

      should(kuzzle.queuing).be.false();
    });

    it('should not start queuing if autoQueue is on', function () {
      var kuzzle = new Kuzzle('foo', {autoQueue: true});

      kuzzle.state = 'offline';
      kuzzle.startQueuing();

      should(kuzzle.queuing).be.false();
    });

    it('should start queing if autoQueue is off and the instance is disconnected', function () {
      var kuzzle = new Kuzzle('foo');

      kuzzle.state = 'offline';
      kuzzle.startQueuing();

      should(kuzzle.queuing).be.true();
    });
  });

  describe('#stopQueuing', function () {
    it('should not stop queuing if the instance is connected', function () {
      var kuzzle = new Kuzzle('foo');

      kuzzle.state = 'connected';
      kuzzle.queuing = true;
      kuzzle.stopQueuing();
      should(kuzzle.queuing).be.true();
    });

    it('should not stop queuing if autoQueue is on', function () {
      var kuzzle = new Kuzzle('foo', {autoQueue: true});

      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.stopQueuing();
      should(kuzzle.queuing).be.true();
    });

    it('should stop queuing if autoQueue is off and the instance is offline', function () {
      var kuzzle = new Kuzzle('foo');

      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.stopQueuing();
      should(kuzzle.queuing).be.false();
    });
  });
});
