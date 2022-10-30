const { RoleSearchResult } = require("../../../src/core/searchResult/Role"),
  { Role } = require("../../../src/core/security/Role"),
  sinon = require("sinon"),
  should = require("should");

describe("RoleSearchResult", () => {
  const options = { opt: "in" };

  let kuzzle, request, result, searchResult;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves(),
    };

    request = {
      body: { foo: "bar" },
      controller: "security",
      action: "searchRoles",
    };

    result = {
      hits: [
        {
          _id: "role1",
          _version: 1,
          _source: { controllers: { foo: { actions: { bar: true } } } },
        },
        {
          _id: "role2",
          _version: 3,
          _source: { controllers: { bar: { actions: { foo: true } } } },
        },
      ],
      total: 30,
    };
  });

  describe("constructor", () => {
    it("should create a RoleSearchResult instance with good properties", () => {
      searchResult = new RoleSearchResult(kuzzle, request, options, result);

      should(searchResult._request).be.equal(request);
      should(searchResult._options).be.equal(options);
      should(searchResult._result).be.equal(result);

      should(searchResult.fetched).be.equal(2);
      should(searchResult.total).be.equal(30);

      should(searchResult._controller).be.equal("security");
      should(searchResult._searchAction).be.equal("searchRoles");
      should(searchResult._scrollAction).be.Null();

      should(searchResult.hits).be.an.Array();
      should(searchResult.hits.length).be.equal(2);

      should(searchResult.hits[0]).be.an.instanceOf(Role);
      should(searchResult.hits[0]._id).be.eql("role1");
      should(searchResult.hits[0].controllers).be.eql({
        foo: { actions: { bar: true } },
      });

      should(searchResult.hits[1]).be.an.instanceOf(Role);
      should(searchResult.hits[1]._id).be.eql("role2");
      should(searchResult.hits[1].controllers).be.eql({
        bar: { actions: { foo: true } },
      });
    });
  });

  describe("next", () => {
    it("should resolve null without calling kuzzle query if all results are already fetched", () => {
      result = {
        scrollId: "scroll-id",
        hits: [
          {
            _id: "role1",
            _version: 1,
            _source: { controllers: { foo: { actions: { bar: true } } } },
          },
          {
            _id: "role2",
            _version: 3,
            _source: { controllers: { bar: { actions: { foo: true } } } },
          },
        ],
        total: 2,
      };

      searchResult = new RoleSearchResult(kuzzle, request, options, result);

      return searchResult.next().then((res) => {
        should(kuzzle.query).not.be.called();
        should(res).be.Null();
      });
    });

    it("should reject with an error if scrollId parameters is set", () => {
      request.scroll = "10s";
      searchResult = new RoleSearchResult(kuzzle, request, options, result);

      return should(searchResult.next()).be.rejectedWith(
        "only from/size params are allowed for role search"
      );
    });

    it("should reject with an error if sort parameters is set", () => {
      request.sort = ["foo", { bar: "asc" }];
      searchResult = new RoleSearchResult(kuzzle, request, options, result);

      return should(searchResult.next()).be.rejectedWith(
        "only from/size params are allowed for role search"
      );
    });

    it("should reject with an error if size and from parameters are not set", () => {
      searchResult = new RoleSearchResult(kuzzle, request, options, result);

      return should(searchResult.next()).be.rejectedWith(
        "Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params"
      );
    });

    describe("#with from and size option", () => {
      const nextResponse = {
        hits: [
          {
            _id: "role3",
            _version: 3,
            _source: { controllers: { foo: { actions: { baz: true } } } },
          },
          {
            _id: "role4",
            _version: 8,
            _source: { controllers: { baz: { actions: { foo: true } } } },
          },
        ],
        total: 30,
      };

      beforeEach(() => {
        request.size = 2;
        request.from = 2;

        searchResult = new RoleSearchResult(kuzzle, request, options, result);

        kuzzle.query.resolves({ result: nextResponse });
      });

      it("should resolve null without calling kuzzle query if from parameter is greater than the search count", () => {
        request.from = 30;

        return searchResult.next().then((res) => {
          should(kuzzle.query).not.be.called();
          should(res).be.Null();
        });
      });

      it("should call security/searchRoles action with from/size parameters and resolve to a new RoleSearchResult", () => {
        return searchResult.next().then((nextSearchResult) => {
          should(kuzzle.query)
            .be.calledOnce()
            .be.calledWith({
              body: { foo: "bar" },
              controller: "security",
              action: "searchRoles",
              size: 2,
              from: 2,
            });
          should(nextSearchResult).not.be.equal(searchResult);
          should(nextSearchResult).be.instanceOf(RoleSearchResult);
        });
      });

      it('should set the result and increment the "fetched" property', () => {
        should(searchResult.fetched).be.equal(2);
        should(searchResult._result).be.equal(result);
        return searchResult.next().then((nextSearchResult) => {
          should(nextSearchResult.fetched).be.equal(4);
          should(nextSearchResult._result).be.equal(nextResponse);

          should(nextSearchResult.hits).be.an.Array();
          should(nextSearchResult.hits.length).be.equal(2);

          should(nextSearchResult.hits[0]).be.an.instanceOf(Role);
          should(nextSearchResult.hits[0]._id).be.eql("role3");
          should(nextSearchResult.hits[0].controllers).be.eql({
            foo: { actions: { baz: true } },
          });

          should(nextSearchResult.hits[1]).be.an.instanceOf(Role);
          should(nextSearchResult.hits[1]._id).be.eql("role4");
          should(nextSearchResult.hits[1].controllers).be.eql({
            baz: { actions: { foo: true } },
          });
        });
      });
    });
  });
});
