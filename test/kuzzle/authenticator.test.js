"use strict";

const should = require("should");
const sinon = require("sinon");
const ProtocolMock = require("../mocks/protocol.mock");
const { Kuzzle } = require("../../src/Kuzzle");
const generateJwt = require("../mocks/generateJwt.mock");
const { KuzzleError } = require("../../src/KuzzleError");
const { RequestTimeoutError } = require("../../src/RequestTimeoutError");

describe("Kuzzle authenticator function mecanisms", () => {
  let kuzzle;
  let protocol;

  beforeEach(() => {
    protocol = new ProtocolMock("somewhere");
    kuzzle = new Kuzzle(protocol);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("jwt property", () => {
    it("should set the SDK property _loggedIn when setting the JWT property", () => {
      kuzzle.jwt = generateJwt();

      should(kuzzle._loggedIn).be.true();
    });

    it("should set the SDK property _loggedIn when setting the JWT property to null or undefined", () => {
      kuzzle.jwt = null;

      should(kuzzle._loggedIn).be.false();
    });
  });

  describe("connected listener", () => {
    let resolve;
    let promise;

    beforeEach(() => {
      kuzzle.auth.checkToken = sinon.stub().resolves(true);
    });

    it("should check the validity of the token at connection to know if we are already logged in", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });

      kuzzle.auth.checkToken.resolves({ valid: true });

      should(kuzzle._loggedIn).be.false();
      kuzzle.emit("connected");

      setTimeout(() => {
        should(kuzzle.auth.checkToken).be.calledOnce();
        should(kuzzle._loggedIn).be.true();
        resolve();
      }, 1);

      return promise;
    });
  });

  describe("login listener", () => {
    let resolve;
    let promise;

    beforeEach(() => {
      kuzzle.auth.checkToken = sinon.stub().resolves(true);
    });

    it("should set _loggedIn to true on successful login attempt", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });

      should(kuzzle._loggedIn).be.false();
      kuzzle.emit("afterLogin", { success: true });

      setTimeout(() => {
        should(kuzzle.auth.checkToken).not.be.calledOnce();
        should(kuzzle._loggedIn).be.true();
        resolve();
      }, 1);

      return promise;
    });

    it("should verify the stored token when the login attempt has failed", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });

      kuzzle.auth.checkToken.resolves({ valid: true });

      should(kuzzle._loggedIn).be.false();
      kuzzle.emit("afterLogin", { success: false, err: new Error("foo") });

      setTimeout(() => {
        should(kuzzle.auth.checkToken).be.calledOnce();
        should(kuzzle._loggedIn).be.true();
        resolve();
      }, 1);

      return promise;
    });
  });

  describe("logout listener", () => {
    let resolve;
    let promise;

    it("should set _loggedIn to false on afterLogout", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });

      kuzzle._loggedIn = true;
      kuzzle.emit("afterLogout", { success: true });

      setTimeout(() => {
        should(kuzzle.auth.checkToken).not.be.calledOnce();
        should(kuzzle._loggedIn).be.false();
        resolve();
      }, 1);

      return promise;
    });
  });

  describe("reconnect listener", () => {
    let reconnectedSpy;
    let resolve;
    let promise;

    beforeEach(() => {
      kuzzle.authenticator = async () => {};

      sinon.stub(kuzzle, "verifySession").resolves("valid");
      sinon.stub(kuzzle, "disconnect");

      reconnectedSpy = sinon.stub();
      kuzzle.on("reconnected", reconnectedSpy);
    });

    it("should try to re-authenticate when reconnecting if an authenticator was set we were logged in", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });
      await kuzzle.connect();

      kuzzle._loggedIn = true;

      protocol.emit("reconnect");

      // We need a timeout since the listener on "reconnect" event is asynchronous
      setTimeout(() => {
        should(kuzzle.verifySession).be.calledOnce();
        should(reconnectedSpy).be.calledOnce();
        resolve();
      }, 1);

      return promise;
    });

    it("should not try to re-authenticate when reconnecting if we were not logged in", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });
      await kuzzle.connect();

      kuzzle._loggedIn = false;

      protocol.emit("reconnect");

      // We need a timeout since the listener on "reconnect" event is asynchronous
      setTimeout(() => {
        should(kuzzle.verifySession).not.be.called();
        should(reconnectedSpy).be.calledOnce();
        resolve();
      }, 1);

      return promise;
    });

    it("should not fire the reconnected event and disconnect the SDK if authentication fail", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });
      await kuzzle.connect();
      kuzzle._loggedIn = true;
      kuzzle.verifySession.resolves("invalid");

      protocol.emit("reconnect");

      // We need a timeout since the listener on "reconnect" even is async
      setTimeout(() => {
        should(kuzzle.verifySession).be.calledOnce();
        should(kuzzle.disconnect).be.calledOnce();
        should(reconnectedSpy).not.be.called();
        resolve();
      }, 1);

      return promise;
    });

    it("should keep the session and fire the reconnected event if the check could not reach Kuzzle while still connected", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });
      // The "connected" listener checks the token: keep it valid
      sinon.stub(kuzzle.auth, "checkToken").resolves({ valid: true });
      await kuzzle.connect();
      kuzzle._loggedIn = true;
      kuzzle.verifySession.resolves("unverified");
      protocol.isReady.returns(true);

      protocol.emit("reconnect");

      setTimeout(() => {
        should(kuzzle.disconnect).not.be.called();
        should(kuzzle._loggedIn).be.true();
        should(reconnectedSpy).be.calledOnce();
        resolve();
      }, 1);

      return promise;
    });

    it("should keep the session and wait for the next reconnection if the socket was lost during the check", async () => {
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });
      // The "connected" listener checks the token: keep it valid
      sinon.stub(kuzzle.auth, "checkToken").resolves({ valid: true });
      await kuzzle.connect();
      kuzzle._loggedIn = true;
      kuzzle.verifySession.resolves("unverified");
      protocol.isReady.returns(false);

      protocol.emit("reconnect");

      setTimeout(() => {
        should(kuzzle.disconnect).not.be.called();
        should(kuzzle._loggedIn).be.true();
        should(reconnectedSpy).not.be.called();
        resolve();
      }, 1);

      return promise;
    });

    it("should not try to authenticate if no authenticator was set", async () => {
      kuzzle.authenticator = null;
      promise = new Promise((_resolve) => {
        resolve = _resolve;
      });
      await kuzzle.connect();
      kuzzle._loggedIn = true;

      protocol.emit("reconnect");

      // We need a timeout since the listener on "reconnect" even is async
      setTimeout(() => {
        should(reconnectedSpy).be.calledOnce();
        resolve();
      }, 1);

      return promise;
    });
  });

  describe("#tryReAuthenticate", () => {
    let reconnectionErrorSpy;

    beforeEach(() => {
      sinon.stub(kuzzle.auth, "checkToken").resolves({ valid: false });
      sinon.stub(kuzzle, "authenticate").resolves();

      reconnectionErrorSpy = sinon.stub();
      kuzzle.on("reconnectionError", reconnectionErrorSpy);

      kuzzle.authenticator = () => {};
    });

    it("should returns true if the token is still valid", async () => {
      kuzzle.auth.checkToken.resolves({ valid: true });

      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.true();
      should(kuzzle.authenticate).not.be.called();
      should(reconnectionErrorSpy).not.be.called();
    });

    it("should returns false if the token is not valid and there is no authenticator and emit a reconnectionError", async () => {
      kuzzle.auth.checkToken.resolves({ valid: false });
      kuzzle.authenticator = null;

      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.false();
      should(kuzzle.authenticate).not.be.called();
      should(reconnectionErrorSpy).be.called();
    });

    it('should call "authenticate" if the token is not valid', async () => {
      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.true();
      should(kuzzle.authenticate).be.calledOnce();
      should(reconnectionErrorSpy).not.be.called();
    });

    it('should return false without emitting "reconnectionError" if the check could not reach Kuzzle', async () => {
      kuzzle.auth.checkToken.rejects(
        new Error(
          "Network error: request was sent but no response has been received",
        ),
      );

      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.false();
      should(kuzzle.authenticate).not.be.called();
      should(reconnectionErrorSpy).not.be.called();
    });

    it('should emit "reconnectionError" if the "authenticator" function fail', async () => {
      kuzzle.authenticate.rejects("auth fail");

      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.false();
      should(reconnectionErrorSpy).be.called();
    });
  });

  describe("#verifySession", () => {
    let reconnectionErrorSpy;

    beforeEach(() => {
      sinon.stub(kuzzle.auth, "checkToken").resolves({ valid: true });
      sinon.stub(kuzzle, "authenticate").resolves();

      reconnectionErrorSpy = sinon.stub();
      kuzzle.on("reconnectionError", reconnectionErrorSpy);
    });

    it('should resolve "valid" if the token is still valid', async () => {
      should(await kuzzle.verifySession()).eql("valid");
      should(kuzzle._reconnectInProgress).be.false();
    });

    it('should resolve "unverified" if the node is shutting down', async () => {
      const error = new KuzzleError({
        id: "api.process.shutting_down",
        message: "Rejected: this node is shutting down.",
        status: 503,
      });
      kuzzle.auth.checkToken.rejects(error);

      should(await kuzzle.verifySession()).eql("unverified");
      should(kuzzle.authenticate).not.be.called();
      should(reconnectionErrorSpy).not.be.called();
      should(kuzzle._reconnectInProgress).be.false();
    });

    it('should resolve "unverified" if the check timed out', async () => {
      kuzzle.auth.checkToken.rejects(
        new RequestTimeoutError({ controller: "auth" }, 100),
      );

      should(await kuzzle.verifySession()).eql("unverified");
      should(reconnectionErrorSpy).not.be.called();
    });

    it('should resolve "invalid" and emit "reconnectionError" if Kuzzle refused the check', async () => {
      kuzzle.auth.checkToken.rejects(
        new KuzzleError({
          id: "security.rights.forbidden",
          message: "Forbidden",
          status: 403,
        }),
      );

      should(await kuzzle.verifySession()).eql("invalid");
      should(reconnectionErrorSpy).be.calledOnce();
    });

    it('should resolve "invalid" if the token is invalid and there is no authenticator', async () => {
      kuzzle.auth.checkToken.resolves({ valid: false });
      kuzzle.authenticator = null;

      should(await kuzzle.verifySession()).eql("invalid");
      should(reconnectionErrorSpy).be.calledOnce();
    });
  });

  describe("#authenticate", () => {
    beforeEach(() => {
      kuzzle.authenticator = async () => {};

      sinon.stub(kuzzle.auth, "checkToken").resolves({ valid: true });

      sinon.spy(kuzzle, "authenticator");
    });

    it('should execute the "authenticator"', async () => {
      await kuzzle.authenticate();

      should(kuzzle.authenticator).be.calledOnce();
      should(kuzzle.auth.checkToken).be.calledOnce();
    });

    it('should throw an error if the "authenticator" is not set', () => {
      kuzzle.authenticator = null;

      should(kuzzle.authenticate()).be.rejected();
    });

    it('should throw an error if the "authenticator" does not authenticate the SDK', () => {
      kuzzle.auth.checkToken.resolves({ valid: false });

      should(kuzzle.authenticate()).be.rejected();
    });
  });
});
