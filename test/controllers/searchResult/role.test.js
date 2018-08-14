const
  RoleSearchResult = require('../../../src/controllers/searchResult/role'),
  Role = require('../../../src/controllers/security/role'),
  sinon = require('sinon'),
  should = require('should');

describe('RoleSearchResult', () => {
  const options = {opt: 'in'};

  let
    kuzzle,
    request,
    response,
    searchResult;

  beforeEach(() => {
    kuzzle = {
      query: sinon.stub().resolves()
    };

    request = {
      body: {foo: 'bar'},
      controller: 'security',
      action: 'searchRoles',
    };

    response = {
      hits: [
        {_id: 'role1', _version: 1, _source: {controllers: {foo: {actions: {bar: true}}}}},
        {_id: 'role2', _version: 3, _source: {controllers: {bar: {actions: {foo: true}}}}}
      ],
      total: 30
    };
  });

  describe('constructor', () => {
    it('should create a RoleSearchResult instance with good properties', () => {
      searchResult = new RoleSearchResult(kuzzle, request, options, response);

      should(searchResult.kuzzle).be.equal(kuzzle);
      should(searchResult.request).be.equal(request);
      should(searchResult.options).be.equal(options);
      should(searchResult.response).be.equal(response);

      should(searchResult.fetched).be.equal(2);
      should(searchResult.total).be.equal(30);

      should(searchResult.controller).be.equal('security');
      should(searchResult.searchAction).be.equal('searchRoles');
      should(searchResult.scrollAction).be.Null();

      should(searchResult.hits).be.an.Array();
      should(searchResult.hits.length).be.equal(2);

      should(searchResult.hits[0]).be.an.instanceOf(Role);
      should(searchResult.hits[0]._id).be.eql('role1');
      should(searchResult.hits[0].controllers).be.eql({foo: {actions: {bar: true}}});

      should(searchResult.hits[1]).be.an.instanceOf(Role);
      should(searchResult.hits[1]._id).be.eql('role2');
      should(searchResult.hits[1].controllers).be.eql({bar: {actions: {foo: true}}});
    });
  });

  describe('next', () => {
    it('should resolve null without calling kuzzle query if all results are already fetched', () => {
      response = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'role1', _version: 1, _source: {controllers: {foo: {actions: {bar: true}}}}},
          {_id: 'role2', _version: 3, _source: {controllers: {bar: {actions: {foo: true}}}}}
        ],
        total: 2
      };

      searchResult = new RoleSearchResult(kuzzle, request, options, response);

      return searchResult.next()
        .then(result => {
          should(kuzzle.query).not.be.called();
          should(result).be.Null();
        });

    });


    it('should throw an error if scrollId parameters is set', () => {
      request.scroll = '1m';
      searchResult = new RoleSearchResult(kuzzle, request, options, response);

      should(function () {
        searchResult.next();
      }).throw('only from/size params are allowed for role search');
    });

    it('should throw an error if sort parameters is set', () => {
      request.sort = ['foo', {bar: 'asc'}];
      searchResult = new RoleSearchResult(kuzzle, request, options, response);

      should(function () {
        searchResult.next();
      }).throw('only from/size params are allowed for role search');
    });

    it('should throw an error if size and from parameters are not set', () => {
      searchResult = new RoleSearchResult(kuzzle, request, options, response);

      should(function () {
        searchResult.next();
      }).throw('Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params');
    });

    describe('#with from and size option', () => {
      const nextResponse = {
        hits: [
          {_id: 'role3', _version: 3, _source: {controllers: {foo: {actions: {baz: true}}}}},
          {_id: 'role4', _version: 8, _source: {controllers: {baz: {actions: {foo: true}}}}}
        ],
        total: 30
      };

      beforeEach(() => {
        request.size = 2;
        request.from = 2;

        searchResult = new RoleSearchResult(kuzzle, request, options, response);

        kuzzle.query.resolves({result: nextResponse});
      });

      it('should resolve null without calling kuzzle query if from parameter is greater than the search count', () => {
        request.from = 30;

        return searchResult.next()
          .then(result => {
            should(kuzzle.query).not.be.called();
            should(result).be.Null();
          });

      });


      it('should call security/searchRoles action with from/size parameters and resolve the current object', () => {
        return searchResult.next()
          .then(res => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                body: {foo: 'bar'},
                controller: 'security',
                action: 'searchRoles',
                size: 2,
                from: 2
              }, options);
            should(res).be.equal(searchResult);
          });
      });

      it('should set the response and increment the "fetched" property', () => {
        should(searchResult.fetched).be.equal(2);
        should(searchResult.response).be.equal(response);
        return searchResult.next()
          .then(() => {
            should(searchResult.fetched).be.equal(4);
            should(searchResult.response).be.equal(nextResponse);

            should(searchResult.hits).be.an.Array();
            should(searchResult.hits.length).be.equal(2);

            should(searchResult.hits[0]).be.an.instanceOf(Role);
            should(searchResult.hits[0]._id).be.eql('role3');
            should(searchResult.hits[0].controllers).be.eql({foo: {actions: {baz: true}}});

            should(searchResult.hits[1]).be.an.instanceOf(Role);
            should(searchResult.hits[1]._id).be.eql('role4');
            should(searchResult.hits[1].controllers).be.eql({baz: {actions: {foo: true}}});
          });
      });
    });
  });
});
