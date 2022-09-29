const should = require("should");
const sinon = require("sinon");

const ProtocolMock = require("../mocks/protocol.mock");

const { Kuzzle } = require("../../src/Kuzzle");

describe("Kuzzle queue", () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock("somewhere");
    kuzzle = new Kuzzle(protocol);
    kuzzle._timeoutRequest = sinon.stub().resolves();
  });

  describe("#flushQueue", () => {
    it("should flush the offline queue", () => {
      kuzzle.offlineQueue.push({ foo: "bar" });

      kuzzle.flushQueue();

      should(kuzzle._offlineQueue).be.empty();
    });
  });

  describe("#playQueue", () => {
    let query;

    beforeEach(() => {
      query = {
        request: {
          requestId: "alfen",
          action: "action",
          controller: "controller",
        },
        timeout: 10000,
      };

      kuzzle.protocol.isReady.returns(true);
      sinon.spy(kuzzle, "_cleanQueue");
    });

    it("should start playing queue", () => {
      sinon.stub(kuzzle, "_dequeue");

      kuzzle.playQueue();

      should(kuzzle._cleanQueue).be.calledOnce();
      should(kuzzle._dequeue).be.calledOnce();
    });

    it("should not play the queue if protocol is not ready", () => {
      sinon.stub(kuzzle, "_dequeue");
      kuzzle.protocol.isReady.returns(false);

      kuzzle.playQueue();

      should(kuzzle._cleanQueue).not.called();
      should(kuzzle._dequeue).not.called();
    });

    it("should play the offline queue", () => {
      kuzzle.offlineQueue.push(query);

      kuzzle.playQueue();

      should(kuzzle._timeoutRequest).be.calledWith(10000, query.request);
    });

    it("should emit an offlineQueuePop event", () => {
      const spy = sinon.spy();
      kuzzle.offlineQueue.push(query);
      kuzzle.addListener("offlineQueuePop", (playedQuery) => {
        spy(playedQuery);
      });

      kuzzle.playQueue();

      should(spy).be.calledWith(query.request);
    });

    it("should play an additional queue returned by offlineQueueLoader", (done) => {
      const query2 = {
        request: {
          requestId: "plum",
          action: "action",
          controller: "controller",
        },
      };

      kuzzle.offlineQueue.push(query);
      kuzzle.offlineQueueLoader = () => [query2];

      kuzzle.playQueue();

      // Wait queries to be dequeued
      setTimeout(() => {
        should(kuzzle._timeoutRequest).be.calledTwice();
        should(kuzzle._timeoutRequest.getCall(0).args[1]).be.eql(
          query2.request
        );
        should(kuzzle._timeoutRequest.getCall(1).args[1]).be.eql(query.request);
        done();
      }, 100);
    });

    it("should play an additional queue returned by an asynchronous offlineQueueLoader", (done) => {
      const query2 = {
        request: {
          requestId: "plum",
          action: "action",
          controller: "controller",
        },
      };

      kuzzle.offlineQueue.push(query);
      kuzzle.offlineQueueLoader = () => {
        return new Promise((resolve) => {
          setImmediate(() => resolve([query2]));
        });
      };

      kuzzle.playQueue();

      // Wait queries to be dequeued
      setTimeout(() => {
        should(kuzzle._timeoutRequest).be.calledTwice();
        should(kuzzle._timeoutRequest.getCall(0).args[1]).be.eql(
          query2.request
        );
        should(kuzzle._timeoutRequest.getCall(1).args[1]).be.eql(query.request);
        done();
      }, 100);
    });

    it("should discard requests queued for too long", async () => {
      kuzzle.queueTTL = 1;

      let resolve;
      let reject;
      let deferred = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      Object.assign(query, {
        resolve,
        reject,
        ts: Date.now() - 1000,
      });

      kuzzle.offlineQueue.push(query);

      let rejectedRequest = sinon.spy();

      kuzzle.on("offlineQueuePop", (request) => {
        rejectedRequest(request);
      });

      kuzzle.playQueue();

      await should(deferred).rejectedWith(
        "Query aborted: queued time exceeded the queueTTL option value"
      );
      should(rejectedRequest).calledOnce().calledWith(query.request);
    });

    it("should discard requests when the queue is full", async () => {
      kuzzle.queueMaxSize = 1;
      kuzzle.queueTTL = 0; // ignore ttl

      let resolve;
      let reject;
      let deferred = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      Object.assign(query, {
        resolve,
        reject,
        ts: Date.now() - 1000,
      });

      kuzzle.offlineQueue.push(query);

      // this one is just to simulate a queue exceeding capacity: queries must
      // be dequeued in order so only "query" should be discarded
      kuzzle.offlineQueue.push({ request: { foo: "bar" } });

      let rejectedRequest = sinon.spy();

      kuzzle.on("offlineQueuePop", (request) => {
        rejectedRequest(request);
      });

      kuzzle.playQueue();

      await should(deferred).rejectedWith(
        "Query aborted: too many queued requests (see the queueMaxSize option)"
      );
      should(rejectedRequest).calledTwice().calledWith(query.request);
    });
  });
});
