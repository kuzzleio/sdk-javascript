"use strict";

const should = require("should");
const sinon = require("sinon");
const { Deprecation } = require("../../src/utils/Deprecation");

describe("Deprecation", () => {
  let deprecationHandler, response;
  const sandbox = sinon.createSandbox();
  const NODE_ENV = process.env.NODE_ENV;

  beforeEach(() => {
    sandbox.stub(console, "warn");
    process.env.NODE_ENV = "development";
    deprecationHandler = new Deprecation(true);

    response = {
      action: "test",
      collection: "collection",
      controller: "controller",
      deprecations: [
        {
          message: "Use this route instead: http://kuzzle:7512/test/succeed",
          version: "6.6.6",
        },
      ],
      error: null,
      index: null,
      node: "nodeJS",
      requestId: "idididididid",
      result: true,
      status: 200,
      volatile: null,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should warn the developer that he is using a deprecated action", () => {
    deprecationHandler.logDeprecation(response);

    should(console.warn)
      .be.calledOnce()
      .be.calledWith(response.deprecations[0].message);
  });

  it("should return the same response as it has received", () => {
    should(deprecationHandler.logDeprecation(response)).match(response);
  });

  it("should handle multiple deprecations", () => {
    response.deprecations.push(response);

    deprecationHandler.logDeprecation(response);

    should(console.warn).be.calledTwice();
  });

  it("should not warn the developer if he refused to", () => {
    deprecationHandler = new Deprecation(false);

    deprecationHandler.logDeprecation(response);

    should(console.warn).not.have.been.called();
  });

  it("should not warn the developer if there is no deprecation", () => {
    response.deprecations = [];

    deprecationHandler.logDeprecation(response);

    should(console.warn).not.have.been.called();
  });

  it("should not warn the developer in production", () => {
    process.env.NODE_ENV = "production";
    deprecationHandler = new Deprecation(true);

    deprecationHandler.logDeprecation(response);

    should(console.warn).not.have.been.called();
  });

  after(() => {
    process.env.NODE_ENV = NODE_ENV;
  });
});
