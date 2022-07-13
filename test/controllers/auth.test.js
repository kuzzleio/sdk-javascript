const sinon = require("sinon");
const should = require("should");

const { KuzzleEventEmitter } = require("../../src/core/KuzzleEventEmitter");
const { Jwt } = require("../../src/core/Jwt");
const { AuthController } = require("../../src/controllers/Auth");
const { User } = require("../../src/core/security/User");
const generateJwt = require("../mocks/generateJwt.mock");

describe("Auth Controller", () => {
  const options = { opt: "in" };
  let jwt, kuzzle;

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
          userId: "kuid",
          description: "description",
          expiresAt: Date.now() + 10000,
          ttl: 10000,
          token: "secret-token",
        },
      };
      kuzzle.query.resolves({ result: apiResult });

      const result = await kuzzle.auth.createApiKey("description", {
        expiresIn: 10000,
        _id: "api-key-id",
        refresh: "wait_for",
      });

      should(kuzzle.query).be.calledWith({
        controller: "auth",
        action: "createApiKey",
        _id: "api-key-id",
        expiresIn: 10000,
        refresh: "wait_for",
        body: {
          description: "description",
        },
      });

      should(result).be.eql(apiResult);
    });
  });

  describe("deleteApiKey", () => {
    it("should send request to Kuzzle API", async () => {
      kuzzle.query.resolves();

      await kuzzle.auth.deleteApiKey("api-key-id", { refresh: "wait_for" });

      should(kuzzle.query).be.calledWith({
        controller: "auth",
        action: "deleteApiKey",
        _id: "api-key-id",
        refresh: "wait_for",
      });
    });
  });

  describe("searchApiKeys", () => {
    it("should send request to Kuzzle API", async () => {
      kuzzle.query.resolves({ result: { hits: [1, 2] } });

      const result = await kuzzle.auth.searchApiKeys(
        { match: {} },
        { from: 1, size: 2 }
      );

      should(kuzzle.query).be.calledWith({
        controller: "auth",
        action: "searchApiKeys",
        body: { match: {} },
        from: 1,
        size: 2,
        lang: undefined,
      });

      should(result).be.eql({ hits: [1, 2] });
    });
  });

  describe("#checkToken", () => {
    it("should call auth/checkToken query with the token and return a Promise which resolves the token validity", () => {
      kuzzle.query.resolves({
        result: {
          valid: true,
          state: "Error message",
          expiresAt: 42424242,
        },
      });

      return kuzzle.auth.checkToken("token", options).then((res) => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWithMatch(
            {
              controller: "auth",
              action: "checkToken",
              body: {
                token: "token",
              },
              cookieAuth: false,
            },
            { queuable: false }
          );
        should(res).match({
          valid: true,
          state: "Error message",
          expiresAt: 42424242,
        });
      });
    });

    it("should call auth/checkToken query with cookieAuth false, the token and return a Promise which resolves the token validity", () => {
      kuzzle.query.resolves({
        result: {
          valid: true,
          state: "Error message",
          expiresAt: 42424242,
        },
      });

      kuzzle.cookieAuthentication = true;

      return kuzzle.auth.checkToken("token", options).then((res) => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWithMatch(
            {
              controller: "auth",
              action: "checkToken",
              body: {
                token: "token",
              },
              cookieAuth: false,
            },
            { queuable: false }
          );
        should(res).match({
          valid: true,
          state: "Error message",
          expiresAt: 42424242,
        });
      });
    });

    it("should call auth/checkToken query with cookieAuth false, the stored token if no token is given and return a Promise which resolves the token validity", () => {
      kuzzle.query.resolves({
        result: {
          valid: true,
          state: "Error message",
          expiresAt: 42424242,
        },
      });

      const token = generateJwt();
      kuzzle.auth.authenticationToken = token;

      kuzzle.cookieAuthentication = false;

      return kuzzle.auth.checkToken(undefined, options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWithMatch(
          {
            controller: "auth",
            action: "checkToken",
            body: {
              token,
            },
            cookieAuth: false,
          },
          { queuable: false }
        );
        should(res).match({
          valid: true,
          state: "Error message",
          expiresAt: 42424242,
        });
      });
    });

    it("should call auth/checkToken query with cookieAuth true, token should be undefined and return a Promise which resolves the token validity", () => {
      kuzzle.query.resolves({
        result: {
          valid: true,
          state: "Error message",
          expiresAt: 42424242,
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
              controller: "auth",
              action: "checkToken",
              body: {
                token: undefined,
              },
              cookieAuth: true,
            },
            { queuable: false }
          );
        should(res).match({
          valid: true,
          state: "Error message",
          expiresAt: 42424242,
        });
      });
    });
  });

  describe("#createMyCredentials", () => {
    it("should call auth/createMyCredentials query with the user credentials and return a Promise which resolves a json object", () => {
      const credentials = { foo: "bar" };

      kuzzle.query.resolves({
        result: {
          username: "foo",
          kuid: "bar",
        },
      });

      return kuzzle.auth
        .createMyCredentials("strategy", credentials, options)
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              strategy: "strategy",
              body: credentials,
              controller: "auth",
              action: "createMyCredentials",
            },
            options
          );

          should(res).match({ username: "foo", kuid: "bar" });
        });
    });
  });

  describe("#credentialsExist", () => {
    it("should call auth/credentialExists query with the strategy name and return a Promise which resolves a boolean", () => {
      kuzzle.query.resolves({ result: true });

      return kuzzle.auth.credentialsExist("strategy", options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            strategy: "strategy",
            controller: "auth",
            action: "credentialsExist",
          },
          options
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
              strategy: "strategy",
              controller: "auth",
              action: "deleteMyCredentials",
            },
            options
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
            controller: "auth",
            action: "getCurrentUser",
          },
          options
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
          username: "foo",
          kuid: "bar",
        },
      });

      return kuzzle.auth.getMyCredentials("strategy", options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            strategy: "strategy",
            controller: "auth",
            action: "getMyCredentials",
          },
          options
        );

        should(res).match({ username: "foo", kuid: "bar" });
      });
    });
  });

  describe("#getMyRights", () => {
    it("should call auth/getMyCredentials query with the strategy name and return a Promise which resolves the user permissions as an array", () => {
      kuzzle.query.resolves({
        result: {
          hits: [
            {
              controller: "foo",
              action: "bar",
              index: "foobar",
              collection: "*",
              value: "allowed",
            },
          ],
        },
      });

      return kuzzle.auth.getMyRights(options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            controller: "auth",
            action: "getMyRights",
          },
          options
        );

        should(res).be.an.Array();
        should(res[0]).match({
          controller: "foo",
          action: "bar",
          index: "foobar",
          collection: "*",
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
            controller: "auth",
            action: "getStrategies",
          },
          options
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
          jwt,
          _id: "kuid",
        },
      });
    });

    it("should call auth/login query and return a Promise which resolves a JWT", () => {
      return kuzzle.auth
        .login("strategy", credentials, "expiresIn")
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              controller: "auth",
              action: "login",
              strategy: "strategy",
              expiresIn: "expiresIn",
              body: credentials,
              cookieAuth: false,
            },
            { queuable: false, verb: "POST", timeout: -1 }
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
              controller: "auth",
              action: "login",
              strategy: "strategy",
              expiresIn: "expiresIn",
              body: credentials,
              cookieAuth: true,
            },
            { queuable: false, verb: "POST", timeout: -1 }
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
              controller: "auth",
              action: "login",
              strategy: "strategy",
              expiresIn: "expiresIn",
              body: credentials,
              cookieAuth: true,
            },
            { queuable: false, verb: "POST", timeout: -1 }
          );

          should(res).be.undefined();
        });
    });

    it('should trigger a "loginAttempt" event once the user is logged in', () => {
      kuzzle.emit = sinon.stub();

      return kuzzle.auth
        .login("strategy", credentials, "expiresIn")
        .then(() => {
          should(kuzzle.emit).be.calledOnce().be.calledWith("loginAttempt");
        });
    });

    it('should trigger a "loginAttempt" event once the user is logged in with cookieAuthentication enabled', () => {
      kuzzle.emit = sinon.stub();
      kuzzle.cookieAuthentication = true;
      kuzzle.query.resolves({
        result: {
          _id: "kuid",
        },
      });

      return kuzzle.auth
        .login("strategy", credentials, "expiresIn")
        .then(() => {
          should(kuzzle.emit).be.calledOnce().be.calledWith("loginAttempt");
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
          controller: "auth",
          action: "logout",
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
  });

  describe("#updateMyCredentials", () => {
    it("should call auth/updateMyCredentials query with the user credentials and return a Promise which resolves a json object", () => {
      const credentials = { foo: "bar" };

      kuzzle.query.resolves({
        result: {
          username: "foo",
          kuid: "bar",
        },
      });

      return kuzzle.auth
        .updateMyCredentials("strategy", credentials, options)
        .then((res) => {
          should(kuzzle.query).be.calledOnce().be.calledWith(
            {
              controller: "auth",
              action: "updateMyCredentials",
              strategy: "strategy",
              body: credentials,
            },
            options
          );

          should(res).match({ username: "foo", kuid: "bar" });
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
            controller: "auth",
            action: "updateSelf",
            body,
          },
          options
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
              strategy: "strategy",
              body,
              controller: "auth",
              action: "validateMyCredentials",
            },
            options
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
          controller: "auth",
          action: "refreshToken",
          expiresIn: undefined,
          cookieAuth: false,
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
          controller: "auth",
          action: "refreshToken",
          expiresIn: undefined,
          cookieAuth: true,
        });

        should(res).be.eql(tokenResponse);
        should(kuzzle.auth.authenticationToken).be.null();
      });
    });

    it("should set the expiresIn option if one is provided", () => {
      return kuzzle.auth.refreshToken({ expiresIn: "foobar" }).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWithMatch({
          controller: "auth",
          action: "refreshToken",
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
      should(function () {
        kuzzle.auth.authenticationToken = 1234;
      }).throw();
    });
  });
});
