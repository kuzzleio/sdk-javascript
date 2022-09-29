const { IndexController } = require("../../src/controllers/Index"),
  sinon = require("sinon"),
  should = require("should");

describe("Index Controller", () => {
  const options = { opt: "in" };
  let kuzzle;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves(),
    };
    kuzzle.index = new IndexController(kuzzle);
  });

  describe("create", () => {
    it("should call index/create query and return a Promise which resolves an acknowledgement", () => {
      kuzzle.query.resolves({
        result: {
          acknowledged: true,
          shards_acknowledged: true,
        },
      });

      return kuzzle.index.create("index", options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            controller: "index",
            action: "create",
            index: "index",
          },
          options
        );

        should(res).be.undefined();
      });
    });
  });

  describe("delete", () => {
    it("should call index/delete query and return a Promise which resolves an acknowledgement", () => {
      kuzzle.query.resolves({
        result: { acknowledged: true },
      });

      return kuzzle.index.delete("index", options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            controller: "index",
            action: "delete",
            index: "index",
          },
          options
        );

        should(res).be.undefined();
      });
    });
  });

  describe("exists", () => {
    it("should call index/exists query and return a Promise which resolves a boolean", () => {
      kuzzle.query.resolves({ result: true });

      return kuzzle.index.exists("index", options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            controller: "index",
            action: "exists",
            index: "index",
          },
          options
        );

        should(res).be.a.Boolean().and.be.true();
      });
    });
  });

  describe("list", () => {
    it("should call index/list query and return a Promise which resolves the list of available indexes", () => {
      const result = {
        indexes: ["foo", "bar", "baz"],
      };
      kuzzle.query.resolves({ result });

      return kuzzle.index.list(options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            controller: "index",
            action: "list",
          },
          options
        );

        should(res).be.equal(result.indexes);
      });
    });
  });

  describe("mDelete", () => {
    it("should call index/mDelete query and return a Promise which resolves the list of deleted indexes", () => {
      const result = {
        deleted: ["foo", "bar"],
      };
      kuzzle.query.resolves({ result });

      return kuzzle.index.mDelete(["foo", "bar"], options).then((res) => {
        should(kuzzle.query)
          .be.calledOnce()
          .be.calledWith(
            {
              controller: "index",
              action: "mDelete",
              body: { indexes: ["foo", "bar"] },
            },
            options
          );

        should(res).be.equal(result.deleted);
      });
    });
  });

  describe("stats", () => {
    it("should call index/stats query and return a Promise which resolves to an object containing detailed storage statistics", () => {
      const result = {
        indexes: [
          {
            name: "nyc-open-data",
            size: 42,
            collections: [
              {
                name: "yellow-taxi",
                documentCount: 42,
                size: 42,
              },
            ],
          },
        ],
      };
      kuzzle.query.resolves({ result });

      return kuzzle.index.stats(options).then((res) => {
        should(kuzzle.query).be.calledOnce().be.calledWith(
          {
            controller: "index",
            action: "stats",
          },
          options
        );

        should(res).be.equal(result);
      });
    });
  });
});
