const should = require("should"),
  sinon = require("sinon"),
  ProtocolMock = require("../mocks/protocol.mock"),
  generateJwt = require("../mocks/generateJwt.mock"),
  { Kuzzle } = require("../../src/Kuzzle");

describe("Kuzzle query management", () => {
  describe("#_timeoutRequest", () => {
    let kuzzle;

    beforeEach(() => {
      const protocol = new ProtocolMock("somewhere");

      kuzzle = new Kuzzle(protocol);
    });

    it("should call protocol.query", async () => {
      await kuzzle._timeoutRequest(10, { foo: "bar" }, { bar: "baz" });
      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWith(
        { foo: "bar" },
        { bar: "baz" }
      );
    });

    it("should resolve the response when a response is obtained before the configured request timeout", async () => {
      kuzzle.protocol.query = async () => {
        // Simulate that we are waiting the response to a query
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve("foo");
          }, 10);
        });
      };
      const response = kuzzle._timeoutRequest(
        100,
        { foo: "bar" },
        { bar: "baz" }
      );
      await should(response).be.resolvedWith("foo");
    });

    it("should reject if a response could not be obtained before the configured request timeout", async () => {
      kuzzle.protocol.query = async () => {
        // Simulate that we are waiting the response to a query
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve("foo");
          }, 100);
        });
      };
      const promise = kuzzle._timeoutRequest(
        10,
        { foo: "bar" },
        { bar: "baz" }
      );
      await should(promise).be.rejected();
    });
  });

  describe("#query", () => {
    const query = {
        controller: "controller",
        action: "action",
        collection: "collection",
        index: "index",
        body: { some: "query" },
      },
      response = {
        result: { foo: "bar" },
      };

    let kuzzle;

    beforeEach(() => {
      const protocol = new ProtocolMock("somewhere");

      kuzzle = new Kuzzle(protocol);
      kuzzle._timeoutRequest = sinon.stub().resolves(response);
    });

    it('should generate a valid request object with no "options" argument and no callback', () => {
      kuzzle.query(query);
      should(kuzzle._timeoutRequest).be.calledOnce();
      should(kuzzle._timeoutRequest).be.calledWith(
        kuzzle._requestTimeout,
        {
          action: "action",
          body: { some: "query" },
          collection: "collection",
          controller: "controller",
          index: "index",
          volatile: {
            sdkInstanceId: kuzzle.protocol.id,
            sdkName: kuzzle.sdkName,
          },
          requestId: sinon.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
        },
        {}
      );
    });

    it("should generate a valid request object", () => {
      kuzzle.query(query, { foo: "bar", baz: "yolo" });
      should(kuzzle._timeoutRequest).be.calledOnce();
      should(kuzzle._timeoutRequest).be.calledWith(
        kuzzle._requestTimeout,
        {
          action: "action",
          body: { some: "query" },
          collection: "collection",
          controller: "controller",
          index: "index",
          volatile: {
            sdkInstanceId: kuzzle.protocol.id,
            sdkName: kuzzle.sdkName,
          },
          requestId: sinon.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
          // propagated arguments
          foo: "bar",
          baz: "yolo",
        },
        { foo: "bar", baz: "yolo" }
      );
    });

    it("should return the good response from Kuzzle", () => {
      return kuzzle
        .query(query, { foo: "bar", baz: "yolo" })
        .then((res) => should(res).be.equal(response));
    });

    it("should manage arguments properly if no options are provided", () => {
      kuzzle.query(query);
      should(kuzzle._timeoutRequest).be.calledOnce();
      should(kuzzle._timeoutRequest).be.calledWith(
        kuzzle._requestTimeout,
        {
          action: "action",
          body: { some: "query" },
          collection: "collection",
          controller: "controller",
          index: "index",
          volatile: {
            sdkInstanceId: kuzzle.protocol.id,
            sdkName: kuzzle.sdkName,
          },
          requestId: sinon.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
        },
        {}
      );
    });

    it("should not define optional members if none was provided", () => {
      kuzzle.query({ controller: "foo", action: "bar" });
      should(kuzzle._timeoutRequest).be.calledWithMatch(
        kuzzle._requestTimeout,
        { collection: undefined }
      );
      should(kuzzle._timeoutRequest).be.calledWithMatch(
        kuzzle._requestTimeout,
        { index: undefined }
      );
    });

    it('should throw an error if the "request" argument if maformed', () => {
      should(function () {
        kuzzle.query("foobar");
      }).throw('Kuzzle.query: Invalid request: "foobar"');
      should(function () {
        kuzzle.query(["foo", "bar"]);
      }).throw('Kuzzle.query: Invalid request: ["foo","bar"]');
    });

    it('should throw an error if the "request.volatile" argument if maformed', () => {
      should(function () {
        kuzzle.query({ volatile: "foobar" });
      }).throw('Kuzzle.query: Invalid volatile argument received: "foobar"');
      should(function () {
        kuzzle.query({ volatile: ["foo", "bar"] });
      }).throw(
        'Kuzzle.query: Invalid volatile argument received: ["foo","bar"]'
      );
    });

    it('should throw an error if the "options" argument if maformed', () => {
      should(function () {
        kuzzle.query({}, "foobar");
      }).throw('Kuzzle.query: Invalid "options" argument: "foobar"');
      should(function () {
        kuzzle.query({}, ["foo", "bar"]);
      }).throw('Kuzzle.query: Invalid "options" argument: ["foo","bar"]');
    });

    it('should handle kuzzle "volatile" properly', () => {
      const volatile = {
        foo: "bar",
        baz: ["foo", "bar", "qux"],
      };

      kuzzle.volatile = volatile;
      kuzzle.query();
      should(kuzzle._timeoutRequest).be.calledOnce();
      should(kuzzle._timeoutRequest).be.calledWithMatch(
        kuzzle._requestTimeout,
        { volatile: kuzzle.volatile }
      );
    });

    it("should copy request local volatile over kuzzle object ones", () => {
      const volatile = {
        foo: "bar",
        baz: ["foo", "bar", "qux"],
      };

      kuzzle.volatile = volatile;

      kuzzle.query({ body: { some: "query" }, volatile: { foo: "foo" } });
      should(kuzzle._timeoutRequest).be.calledOnce();
      should(kuzzle._timeoutRequest).be.calledWithMatch(
        kuzzle._requestTimeout,
        { volatile: { foo: "foo", baz: volatile.baz } }
      );
    });

    it('should allow to override "sdkInstanceId" and "sdkName" volatile data', () => {
      kuzzle.protocol.id = "kuz-sdk-instance-id";
      kuzzle.sdkName = "kuz-sdk-version";

      const volatile = {
        sdkInstanceId: "req-sdk-instance-id",
        sdkName: "req-sdk-version",
      };
      kuzzle.query({ body: { some: "query" }, volatile });

      should(kuzzle._timeoutRequest).be.calledOnce();
      should(kuzzle._timeoutRequest).be.calledWithMatch(
        kuzzle._requestTimeout,
        {
          volatile: {
            sdkInstanceId: "req-sdk-instance-id",
            sdkName: "req-sdk-version",
          },
        }
      );
    });

    it('should handle option "refresh" properly', () => {
      kuzzle.query({ refresh: "wait_for" });
      should(kuzzle._timeoutRequest).be.calledWithMatch(
        kuzzle._requestTimeout,
        { refresh: "wait_for" }
      );

      kuzzle.query({ refresh: false });
      should(kuzzle._timeoutRequest).be.calledWithMatch(
        kuzzle._requestTimeout,
        { refresh: false }
      );
    });

    it("should not generate a new request ID if one is already defined", () => {
      kuzzle.query({ body: { some: "query" }, requestId: "foobar" });
      should(kuzzle._timeoutRequest).be.calledOnce();
      should(kuzzle._timeoutRequest).be.calledWithMatch(
        kuzzle._requestTimeout,
        { requestId: "foobar" }
      );
    });

    it("should set jwt except for auth/checkToken", () => {
      const jwt = generateJwt();
      kuzzle.jwt = jwt;

      kuzzle.query({ controller: "foo", action: "bar" }, {});
      kuzzle.query({ controller: "auth", action: "checkToken" }, {});

      should(kuzzle._timeoutRequest).be.calledTwice();
      should(kuzzle._timeoutRequest.firstCall.args[1].jwt).be.exactly(jwt);
      should(kuzzle._timeoutRequest.secondCall.args[1].jwt).be.undefined();
    });

    it("should queue the request if queing and queuable", () => {
      kuzzle._queuing = true;

      const eventStub = sinon.stub();
      kuzzle.addListener("offlineQueuePush", eventStub);

      const request = { controller: "foo", action: "bar" };

      kuzzle.query(request, {});

      should(kuzzle._timeoutRequest).not.be.called();
      should(eventStub).be.calledOnce().be.calledWithMatch({ request });

      should(kuzzle._offlineQueue.length).be.eql(1);
    });

    it("should not queue if the request is not queuable", () => {
      kuzzle._queuing = true;

      const eventStub = sinon.stub();
      kuzzle.addListener("discarded", eventStub);

      const request = {
        controller: "foo",
        action: "bar",
      };

      return kuzzle
        .query(request, { queuable: false })
        .then(() => {
          throw new Error("no error");
        })
        .catch(() => {
          should(kuzzle._timeoutRequest).not.be.called();
          should(kuzzle._offlineQueue.length).eql(0);
          should(eventStub).be.calledOnce().be.calledWithMatch({ request });
        });
    });

    it("should not queue if queueFilter is set and says so", () => {
      kuzzle._queuing = true;
      kuzzle.queueFilter = () => false;

      return kuzzle
        .query({ controller: "foo", action: "bar" }, { queuable: true })
        .then(() => {
          throw new Error("no error");
        })
        .catch(() => {
          should(kuzzle._timeoutRequest).be.not.be.called();
        });
    });

    it("should clone the original request", async () => {
      const request = { controller: "server", action: "now" };

      await kuzzle.query(request);

      should(request).be.eql({ controller: "server", action: "now" });
    });

    it("should call logDeprecation with the response", async () => {
      kuzzle.deprecationHandler.logDeprecation = sinon.stub().returns(response);
      await kuzzle.query(query);

      should(kuzzle.deprecationHandler.logDeprecation)
        .be.calledOnce()
        .be.calledWith(response);
    });
  });
});
