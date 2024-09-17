const should = require("should");
const sinon = require("sinon");

const { Kuzzle } = require("../../src/Kuzzle");
const { KuzzleEventEmitter } = require("../../src/core/KuzzleEventEmitter");
const ProtocolMock = require("../mocks/protocol.mock");

describe("Kuzzle listeners management", () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock();
    kuzzle = new Kuzzle(protocol, { eventTimeout: 20 });
    sinon.stub(KuzzleEventEmitter.prototype, "addListener").resolves();
    sinon.stub(KuzzleEventEmitter.prototype, "emit").resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should only listen to allowed events", () => {
    const knownEvents = [
      "callbackError",
      "connected",
      "discarded",
      "disconnected",
      "loginAttempt",
      "beforeLogin",
      "afterLogin",
      "logoutAttempt",
      "beforeLogout",
      "afterLogout",
      "networkError",
      "offlineQueuePush",
      "offlineQueuePop",
      "queryError",
      "reAuthenticated",
      "reconnected",
      "reconnectionError",
      "tokenExpired",
    ];

    should(function () {
      kuzzle.addListener("foo", sinon.stub());
    }).throw(
      "[foo] is not a known event. Known events: " + knownEvents.join(", ")
    );

    let i;
    for (i = 0; i < knownEvents.length; i++) {
      kuzzle.addListener(knownEvents[i], sinon.stub());
    }

    should(KuzzleEventEmitter.prototype.addListener).have.called(10);

    for (i = 0; i < knownEvents.length; i++) {
      should(KuzzleEventEmitter.prototype.addListener.getCall(i)).be.calledWith(
        knownEvents[i]
      );
    }
  });

  it("should not re-emit an event before event timeout", (done) => {
    kuzzle.emit("connected", "foo");
    kuzzle.emit("connected", "foo");
    kuzzle.emit("connected", "foo");
    kuzzle.emit("connected", "foo");
    kuzzle.emit("offlineQueuePush", "bar");

    setTimeout(function () {
      should(KuzzleEventEmitter.prototype.emit).be.calledTwice();
      should(KuzzleEventEmitter.prototype.emit.firstCall).be.calledWith(
        "connected",
        "foo"
      );
      should(KuzzleEventEmitter.prototype.emit.secondCall).be.calledWith(
        "offlineQueuePush",
        "bar"
      );

      KuzzleEventEmitter.prototype.emit.reset();
      setTimeout(function () {
        kuzzle.emit("connected", "bar");
        kuzzle.emit("connected", "bar");

        setTimeout(function () {
          should(KuzzleEventEmitter.prototype.emit).be.calledOnce();
          should(KuzzleEventEmitter.prototype.emit).be.calledWith(
            "connected",
            "bar"
          );
          done();
        }, 0);
      }, 30);
    }, 0);
  });
});
