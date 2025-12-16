"use strict";

const sinon = require("sinon");
const should = require("should");

const { KuzzleEventEmitter } = require("../../src/core/KuzzleEventEmitter");
const { Jwt } = require("../../src/core/Jwt");
const { AuthController } = require("../../src/controllers/Auth");
const { User } = require("../../src/core/security/User");
const generateJwt = require("../mocks/generateJwt.mock");

/**
 * Kuzzle interface
 *
 * @typedef {Object} Kuzzle
 * @property {import("sinon").SinonStub} Kuzzle.query
 * @property {import("sinon").SinonStub} Kuzzle.emit
 * @property {boolean} Kuzzle.cookieAuthentication
 */

describe("Auth Controller", () => {
  const options = { opt: "in" };
  /** @type {Kuzzle} */
  let kuzzle;
  let jwt;

  beforeEach(() => {
    kuzzle = new KuzzleEventEmitter();
    kuzzle.query = sinon.stub();
    kuzzle.cookieAuthentication = false;

    kuzzle.auth = new AuthController(kuzzle);
  });

  describe("on: tokenExpired", () => {
    it("should set the authenticationToken to null", () => {
      kuzzle.auth.authenticationToken = generateJwt();

      kuzzle.emit("tokenExpired");

      process.nextTick(() => {
        should(kuzzle.auth.authenticationToken).be.null();
      });
    });
  });

  describe("createApiKey", () => {
    it("should send request to Kuzzle API", async () => {
      const apiResult = {
        _id: "api-key-id",
        _source: {
          description: "description",
          expiresAt: Date.now() + 10000,
          token: "secret-token",
          ttl: 10000,
          userId: "kuid",
        },
      };
      kuzzle.query.resolves({ result: apiResult });

      const result = await kuzzle.auth.createApiKey("description", {
        _id: "api-key-id",
        expiresIn: 10000,
        refresh: "wait_for",
      });

      should(kuzzle.query).be.calledWith({
        _id: "api-key-id",
        action: "createApiKey",
        body: {
          description: "description",
        },
        controller: "auth",
        expiresIn: 10000,
        refresh: "wait_for",
      });

      should(result).be.eql(apiResult);
    });
  });

  describe("deleteApiKey", () => {
    it("should send request to Kuzzle API", async () => {
      kuzzle.query.resolves();

      await kuzzle.auth.deleteApiKey("api-key-id", { refresh: "wait_for" });

      should(kuzzle.query).be.calledWith({
        _id: "api-key-id",
        action: "deleteApiKey",
        controller: "auth",
        refresh: "wait_for",
      });
    });
  });

  describe("searchApiKeys", () => {
    it("should send request to Kuzzle API", async () => {
      kuzzle.query.resolves({ result: { hits: [1, 2] } });

      const result = await kuzzle.auth.searchApiKeys(
        { match: {} },
        { from: 1, size: 2 },
      );

      should(kuzzle.query).be.calledWith({
        action: "searchApiKeys",
        body: { match: {} },
        controller: "auth",
        from: 1,
        lang: undefined,
        size: 2,
      });

      should(result).be.eql({ hits: [1, 2] });
    });
  });

  describe("#checkToken", () => {
    it("should call auth/checkToken query with the token and return a Promise which resolves the token validity", () => {
      kuzzle.query.resolves({
        result: {
          expiresAt: 42424242,
          state: "Error message",
          valid: true,
        },
      });

      return kuzzle.auth.checkToken("token", options).then((res) => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWithMatch(
            {
              action: "checkToken",
              body: {
                token: "token",
              },
              controller: "auth",
              cookieAuth: false,
            },
            { queuable: false },
          );
        should(res).match({
          expiresAt: 42424242,
          state: "Error message",
          valid: true,
        });
      });
    });

    it("should call auth/checkToken query with cookieAuth false, the token and return a Promise which resolves the token validity", () => {
      kuzzle.query.resolves({
        result: {
          expiresAt: 42424242,
          state: "Error message",
          valid: true,
        },
      });

      kuzzle.cookieAuthentication = true;

      return kuzzle.auth.checkToken("token", options).then((res) => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWithMatch(
            {
              action: "checkToken",
              body: {
                token: "token",
              },
              controller: "auth",
              cookieAuth: false,
            },
            { queuable: false },
          );
        should(res).match({
          expiresAt: 42424242,
          state: "Error message",
          valid: true,
        });
      });
    });

    it("should call auth/checkToken query with cookieAuth false, the stored token if no token is given and return a Promise which resolves the token validity", () => {
      kuzzle.query.resolves({
        result: {
          expiresAt: 42424242,
          state: "Error message",
          valid: true,
        },
      });

      const token = generateJwt();
      kuzzle.auth.authenticationToken = token;

      kuzzle.cookieAuthentication = false;

      return kuzzle.auth.checkToken(undefined, options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWithMatch(
          {
            action: "checkToken",
            body: {
              token,
            },
            controller: "auth",
            cookieAuth: false,
          },
          { queuable: false },
        );
        should(res).match({
          expiresAt: 42424242,
          state: "Error message",
          valid: true,
        });
      });
    });

    it("should call auth/checkToken query with cookieAuth true, token should be undefined and return a Promise which resolves the token validity", () => {
      kuzzle.query.resolves({
        result: {
          expiresAt: 42424242,
          state: "Error message",
          valid: true,
        },
      });

      const token = generateJwt();
      kuzzle.auth.authenticationToken = token;

      kuzzle.cookieAuthentication = true;

      return kuzzle.auth.checkToken(undefined, options).then((res) => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWithMatch(
            {
              action: "checkToken",
              body: {
                token: undefined,
              },
              controller: "auth",
              cookieAuth: true,
            },
            { queuable: false },
          );
        should(res).match({
          expiresAt: 42424242,
          state: "Error message",
          valid: true,
        });
      });
    });
  });

  describe("#createMyCredentials", () => {
    it("should call auth/createMyCredentials query with the user credentials and return a Promise which resolves a json object", () => {
      const credentials = { foo: "bar" };

      kuzzle.query.resolves({
        result: {
          kuid: "bar",
          username: "foo",
        },
      });

      return kuzzle.auth
        .createMyCredentials("strategy", credentials, options)
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              action: "createMyCredentials",
              body: credentials,
              controller: "auth",
              strategy: "strategy",
            },
            options,
          );

          should(res).match({ kuid: "bar", username: "foo" });
        });
    });
  });

  describe("#credentialsExist", () => {
    it("should call auth/credentialExists query with the strategy name and return a Promise which resolves a boolean", () => {
      kuzzle.query.resolves({ result: true });

      return kuzzle.auth.credentialsExist("strategy", options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            action: "credentialsExist",
            controller: "auth",
            strategy: "strategy",
          },
          options,
        );

        should(res).be.exactly(true);
      });
    });
  });

  describe("#deleteMyCredentials", () => {
    it("should call auth/deleteMyCredentials query with the strategy name and return a Promise which resolves an acknowledgement", () => {
      kuzzle.query.resolves({ result: { acknowledged: true } });

      return kuzzle.auth
        .deleteMyCredentials("strategy", options)
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              action: "deleteMyCredentials",
              controller: "auth",
              strategy: "strategy",
            },
            options,
          );

          should(res).be.exactly(true);
        });
    });
  });

  describe("#getCurrentUser", () => {
    it("should call auth/getCurrentUser query and return a Promise which resolves a User object", () => {
      kuzzle.query.resolves({
        result: {
          _id: "id",
          _source: { name: "Doe" },
        },
      });

      return kuzzle.auth.getCurrentUser(options).then((user) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            action: "getCurrentUser",
            controller: "auth",
          },
          options,
        );

        should(user).be.an.instanceOf(User);
        should(user._id).eql("id");
        should(user.content).eql({ name: "Doe" });
      });
    });
  });

  describe("#getMyCredentials", () => {
    it("should call auth/getMyCredentials query with the strategy name and return a Promise which resolves the user credentials", () => {
      kuzzle.query.resolves({
        result: {
          kuid: "bar",
          username: "foo",
        },
      });

      return kuzzle.auth.getMyCredentials("strategy", options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            action: "getMyCredentials",
            controller: "auth",
            strategy: "strategy",
          },
          options,
        );

        should(res).match({ kuid: "bar", username: "foo" });
      });
    });
  });

  describe("#getMyRights", () => {
    it("should call auth/getMyCredentials query with the strategy name and return a Promise which resolves the user permissions as an array", () => {
      kuzzle.query.resolves({
        result: {
          hits: [
            {
              action: "bar",
              collection: "*",
              controller: "foo",
              index: "foobar",
              value: "allowed",
            },
          ],
        },
      });

      return kuzzle.auth.getMyRights(options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            action: "getMyRights",
            controller: "auth",
          },
          options,
        );

        should(res).be.an.Array();
        should(res[0]).match({
          action: "bar",
          collection: "*",
          controller: "foo",
          index: "foobar",
          value: "allowed",
        });
      });
    });
  });

  describe("#getStrategies", () => {
    it("should call auth/getStrategies query and return a Promise which resolves the list of strategies as an array", () => {
      kuzzle.query.resolves({ result: ["local", "github", "foo", "bar"] });

      return kuzzle.auth.getStrategies(options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            action: "getStrategies",
            controller: "auth",
          },
          options,
        );

        should(res).be.an.Array();
        should(res[0]).be.equal("local");
        should(res[1]).be.equal("github");
        should(res[2]).be.equal("foo");
        should(res[3]).be.equal("bar");
      });
    });
  });

  describe("#login", () => {
    const credentials = { foo: "bar" };

    beforeEach(() => {
      jwt = generateJwt();

      kuzzle.query.resolves({
        result: {
          _id: "kuid",
          jwt,
        },
      });
    });

    it("should call auth/login query and return a Promise which resolves a JWT", () => {
      return kuzzle.auth
        .login("strategy", credentials, "expiresIn")
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              action: "login",
              body: credentials,
              controller: "auth",
              cookieAuth: false,
              expiresIn: "expiresIn",
              strategy: "strategy",
            },
            { queuable: false, timeout: -1, verb: "POST" },
          );

          should(res).be.equal(jwt);
        });
    });

    it("should call auth/login with cookieAuth query and throw if there is a JWT in the response", () => {
      kuzzle.cookieAuthentication = true;
      return should(kuzzle.auth.login("strategy", credentials, "expiresIn"))
        .be.rejected()
        .then(() => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              action: "login",
              body: credentials,
              controller: "auth",
              cookieAuth: true,
              expiresIn: "expiresIn",
              strategy: "strategy",
            },
            { queuable: false, timeout: -1, verb: "POST" },
          );
        });
    });

    it("should call auth/login with cookieAuth query and return a Promise which resolves to undefined", () => {
      kuzzle.cookieAuthentication = true;
      kuzzle.query.resolves({
        result: {
          _id: "kuid",
        },
      });
      return kuzzle.auth
        .login("strategy", credentials, "expiresIn")
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              action: "login",
              body: credentials,
              controller: "auth",
              cookieAuth: true,
              expiresIn: "expiresIn",
              strategy: "strategy",
            },
            { queuable: false, timeout: -1, verb: "POST" },
          );

          should(res).be.undefined();
        });
    });

    it("should trigger a login events the user is logged in", async () => {
      kuzzle.emit = sinon.stub();

      await kuzzle.auth.login("strategy", credentials, "expiresIn").then(() => {
        should(kuzzle.emit).be.calledWith("beforeLogin");
        should(kuzzle.emit).be.calledWith("afterLogin", { success: true });
        should(kuzzle.emit).be.calledWith("loginAttempt", { success: true });
      });
      kuzzle.emit.reset();

      kuzzle.query.rejects();
      await kuzzle.auth
        .login("strategy", credentials, "expiresIn")
        .catch(() => {
          should(kuzzle.emit).be.calledWith("beforeLogin");
          should(kuzzle.emit).be.calledWith("afterLogin", {
            error: "Error",
            success: false,
          });
          should(kuzzle.emit).be.calledWith("loginAttempt", {
            error: "Error",
            success: false,
          });
        });
    });

    it("should trigger a login events the user is logged in with cookieAuthentication enabled", async () => {
      kuzzle.emit = sinon.stub();
      kuzzle.cookieAuthentication = true;
      kuzzle.query.resolves({
        result: {
          _id: "kuid",
        },
      });

      await kuzzle.auth.login("strategy", credentials, "expiresIn").then(() => {
        should(kuzzle.emit).be.calledWith("beforeLogin");
        should(kuzzle.emit).be.calledWith("afterLogin", { success: true });
        should(kuzzle.emit).be.calledWith("loginAttempt", { success: true });
      });
      kuzzle.emit.reset();

      kuzzle.query.rejects();
      await should(kuzzle.auth.login("strategy", credentials, "expiresIn"))
        .be.rejected()
        .catch(() => {
          should(kuzzle.emit).be.calledWith("beforeLogin");
          should(kuzzle.emit).be.calledWith("afterLogin", {
            error: "Error",
            success: false,
          });
          should(kuzzle.emit).be.calledWith("loginAttempt", {
            error: "Error",
            success: false,
          });
        });
    });

    it("should construct a new Jwt", () => {
      return kuzzle.auth
        .login("strategy", credentials, "expiresIn")
        .then(() => {
          should(kuzzle.auth.authenticationToken).not.be.null();
          should(kuzzle.auth.authenticationToken).be.instanceOf(Jwt);
        });
    });

    it("should not construct a new Jwt when cookieAuthentication is enabled", () => {
      kuzzle.cookieAuthentication = true;

      kuzzle.query.resolves({
        result: {
          _id: "kuid",
        },
      });

      return kuzzle.auth
        .login("strategy", credentials, "expiresIn")
        .then(() => {
          should(kuzzle.auth.authenticationToken).be.null();
        });
    });
  });

  describe("#logout", () => {
    beforeEach(() => {
      kuzzle.auth.authenticationToken = generateJwt();
      kuzzle.query.resolves({ result: { aknowledged: true } });
    });

    it("should call auth/logout query and return an empty Promise", () => {
      return kuzzle.auth.logout().then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith({
          action: "logout",
          controller: "auth",
          cookieAuth: false,
        });

        should(res).be.undefined();
      });
    });

    it("should unset the authenticationToken property", () => {
      return kuzzle.auth.logout().then(() => {
        should(kuzzle.auth.authenticationToken).be.null();
      });
    });

    // ? Legacy event
    it('should trigger a legacy "logoutAttempt" event the user is logged out', async () => {
      kuzzle.emit = sinon.stub();
      await kuzzle.auth.logout().then(() => {
        should(kuzzle.emit).be.calledWith("logoutAttempt", { success: true });
      });
      kuzzle.emit.reset();

      // ? Fail logout
      kuzzle.query.rejects();
      await kuzzle.auth.logout().catch(() => {
        should(kuzzle.emit).be.calledWith("logoutAttempt", {
          error: "Error",
          success: false,
        });
      });
    });

    it("should trigger logout events when the user is logged out", async () => {
      kuzzle.emit = sinon.stub();
      await kuzzle.auth.logout().then(() => {
        should(kuzzle.emit).be.calledWith("beforeLogout");
        should(kuzzle.emit).be.calledWith("afterLogout", { success: true });
      });
      kuzzle.emit.reset();

      // ? Fail logout
      kuzzle.query.rejects();
      await kuzzle.auth.logout().catch(() => {
        should(kuzzle.emit).be.calledWith("afterLogout", {
          error: "Error",
          success: false,
        });
      });
    });
  });

  describe("#updateMyCredentials", () => {
    it("should call auth/updateMyCredentials query with the user credentials and return a Promise which resolves a json object", () => {
      const credentials = { foo: "bar" };

      kuzzle.query.resolves({
        result: {
          kuid: "bar",
          username: "foo",
        },
      });

      return kuzzle.auth
        .updateMyCredentials("strategy", credentials, options)
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              action: "updateMyCredentials",
              body: credentials,
              controller: "auth",
              strategy: "strategy",
            },
            options,
          );

          should(res).match({ kuid: "bar", username: "foo" });
        });
    });
  });

  describe("#updateSelf", () => {
    it("should call auth/updateSelf query with the user content and return a Promise which resolves a User object", () => {
      const body = { foo: "bar" };

      kuzzle.query.resolves({
        result: {
          _id: "kuid",
          _source: { foo: "bar" },
        },
      });

      return kuzzle.auth.updateSelf(body, options).then((user) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            action: "updateSelf",
            body,
            controller: "auth",
          },
          options,
        );

        should(user).be.an.instanceOf(User);
        should(user._id).eql("kuid");
        should(user.content).eql({ foo: "bar" });
      });
    });
  });

  describe("#validateMyCredentials", () => {
    it("should call auth/validateMyCredentials query with the strategy and its credentials and return a Promise which resolves a boolean", () => {
      const body = { foo: "bar" };

      kuzzle.query.resolves({ result: true });

      return kuzzle.auth
        .validateMyCredentials("strategy", body, options)
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              action: "validateMyCredentials",
              body,
              controller: "auth",
              strategy: "strategy",
            },
            options,
          );

          should(res).be.exactly(true);
        });
    });
  });

  describe("#refreshToken", () => {
    const tokenResponse = { _id: "foo", jwt: generateJwt() };

    beforeEach(() => {
      kuzzle.auth.jwt = generateJwt();
      kuzzle.query.resolves({ result: tokenResponse });
    });

    it("should call auth/refreshToken query", () => {
      return kuzzle.auth.refreshToken().then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith({
          action: "refreshToken",
          controller: "auth",
          cookieAuth: false,
          expiresIn: undefined,
        });

        should(res).be.eql(tokenResponse);
        should(kuzzle.auth.authenticationToken).not.be.null();
        should(kuzzle.auth.authenticationToken).be.instanceOf(Jwt);
      });
    });

    it("should call auth/refreshToken query and authenticationToken should be null", () => {
      kuzzle.cookieAuthentication = true;
      return kuzzle.auth.refreshToken().then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith({
          action: "refreshToken",
          controller: "auth",
          cookieAuth: true,
          expiresIn: undefined,
        });

        should(res).be.eql(tokenResponse);
        should(kuzzle.auth.authenticationToken).be.null();
      });
    });

    it("should set the expiresIn option if one is provided", () => {
      return kuzzle.auth.refreshToken({ expiresIn: "foobar" }).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWithMatch({
          action: "refreshToken",
          controller: "auth",
          expiresIn: "foobar",
        });

        should(res).be.eql(tokenResponse);
        should(kuzzle.auth.authenticationToken).not.be.null();
        should(kuzzle.auth.authenticationToken).be.instanceOf(Jwt);
      });
    });
  });

  describe("#set authenticationToken", () => {
    beforeEach(() => {
      jwt = generateJwt();
    });

    it("should unset the authenticationToken property if parameter is null", () => {
      kuzzle.auth.authenticationToken = jwt;
      kuzzle.auth.authenticationToken = null;

      should(kuzzle.auth.authenticationToken).be.null();
    });

    it("should set the authenticationToken property if parameter is a string", () => {
      kuzzle.auth.authenticationToken = jwt;

      should(kuzzle.auth.authenticationToken).be.instanceOf(Jwt);
      should(kuzzle.auth.authenticationToken.encodedJwt).be.eql(jwt);
    });

    it("should throw if parameter is not a string", () => {
      should(function auth() {
        kuzzle.auth.authenticationToken = 1234;
      }).throw();
    });
  });
});
