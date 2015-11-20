var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle');

describe('Kuzzle: offline queue management', () => {
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
      now = Date.now(),
      kuzzle;

    beforeEach(function () {
      var
        pastTime = 60000;

      kuzzle = new Kuzzle('foo');

      // queuing a bunch of requests from 1min ago to right now, 10s apart
      while (pastTime >= 0) {
        kuzzle.offlineQueue.push({ts: now - pastTime, query: {}, cb: function () {}});
        pastTime -= 10000;
      }
    });

    it('should remove outdated queued requests', function () {
      // setting the request TTL to 5s
      kuzzle.queueTTL = 5000;

      cleanQueue.call(kuzzle);

      // should keep only the latest requests, dating from a few ms ago
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).be.above(now - kuzzle.queueTTL);
    });

    it('should ignore requests timestamps if queueTTL is 0', function () {
      var numRequests = kuzzle.offlineQueue.length;

      kuzzle.queueTTL = 0;
      cleanQueue.call(kuzzle);
      should(kuzzle.offlineQueue.length).be.exactly(numRequests);
    });

    it('should remove older requests until the queueMaxSize condition is met', function () {
      var lastRequest = kuzzle.offlineQueue[kuzzle.offlineQueue.length - 1];

      kuzzle.queueMaxSize = 1;
      cleanQueue.call(kuzzle);
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0]).match(lastRequest);
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
      kuzzle.socket = { emit: function () { sent++; } };
      kuzzle.queuing = true;

      // queuing a bunch of requests from 1min ago to right now, 10s apart
      while (pastTime >= 0) {
        kuzzle.offlineQueue.push({ts: now - pastTime, query: {}});
        pastTime -= 10000;
      }
    });

    it('should play all queued requests', function (done) {
      var numRequests = kuzzle.offlineQueue.length;

      this.timeout(200);
      dequeue.call(kuzzle);

      setTimeout(() => {
        should(sent).be.exactly(numRequests);
        should(kuzzle.offlineQueue).be.an.Array();
        should(kuzzle.offlineQueue.length).be.exactly(0);
        should(kuzzle.queuing).be.false();
        done();
      }, numRequests * kuzzle.replayInterval + 10)
    });
  });
});
