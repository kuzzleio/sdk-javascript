const
  DocumentSearchResult = require('../../../src/core/searchResult/Document'),
  sinon = require('sinon'),
  should = require('should');

describe('DocumentSearchResult', () => {
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
      index: 'index',
      collection: 'collection',
      body: {
        query: {
          foo: 'bar'
        }
      },
      controller: 'document',
      action: 'search',
    };
  });

  describe('constructor', () => {
    it('should create a DocumentSearchResult instance with good properties', () => {
      response = {
        hits: [
          {_id: 'document1', _score: 0.9876, _source: {foo: 'bar'}},
          {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar'}}
        ],
        total: 3
      };

      searchResult = new DocumentSearchResult(kuzzle, request, options, response);

      should(searchResult._request).be.equal(request);
      should(searchResult._options).be.equal(options);
      should(searchResult._response).be.equal(response);

      should(searchResult.hits).be.equal(response.hits);
      should(searchResult.fetched).be.equal(2);
      should(searchResult.total).be.equal(3);

      should(searchResult._controller).be.equal('document');
      should(searchResult._searchAction).be.equal('search');
      should(searchResult._scrollAction).be.equal('scroll');
    });
  });

  describe('next', () => {
    it('should resolve null without calling kuzzle query if all results are already fetched', () => {
      response = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'document1', _score: 0.9876, _source: {foo: 'bar'}},
          {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar'}}
        ],
        total: 2
      };

      searchResult = new DocumentSearchResult(kuzzle, request, options, response);

      return searchResult.next()
        .then(result => {
          should(kuzzle.query).not.be.called();
          should(result).be.Null();
        });

    });

    it('should throw an error if neither scroll, nor size/sort, nor size/from parameters are set', () => {
      response = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'document1', _score: 0.9876, _source: {foo: 'bar'}},
          {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar'}}
        ],
        total: 30
      };

      searchResult = new DocumentSearchResult(kuzzle, request, options, response);

      return should(searchResult.next())
        .be.rejectedWith('Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params');
    });

    describe('#with scroll option', () => {
      const nextResponse = {
        scrollId: 'scroll-id',
        hits: [
          {_id: 'document3', _score: 0.6543, _source: {foo: 'barbaz'}},
          {_id: 'document4', _score: 0.6123, _source: {foo: 'bazbar'}}
        ],
        aggregations: 'nextAggregations',
        total: 30
      };

      beforeEach(() => {
        request.scroll = '10s';

        response = {
          scrollId: 'scroll-id',
          hits: [
            {_id: 'document1', _score: 0.9876, _source: {foo: 'bar'}},
            {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar'}}
          ],
          aggregations: 'aggregations',
          total: 30
        };
        searchResult = new DocumentSearchResult(kuzzle, request, options, response);

        kuzzle.query.resolves({result: nextResponse});
      });

      it('should call document/scroll action with scrollId parameter and resolve to a new DocumentSearchResult', () => {
        return searchResult.next()
          .then(nextSearchResult => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                controller: 'document',
                action: 'scroll',
                scroll: '10s',
                scrollId: 'scroll-id'
              }, options);
            should(nextSearchResult).not.be.equal(searchResult);
            should(nextSearchResult).be.instanceOf(DocumentSearchResult);
          });
      });

      it('should set the response and increment the "fetched" property', () => {
        should(searchResult.fetched).be.equal(2);
        should(searchResult._response).be.equal(response);
        should(searchResult.aggregations).equal(response.aggregations);
        return searchResult.next()
          .then(nextSearchResult => {
            should(nextSearchResult.fetched).be.equal(4);
            should(nextSearchResult._response).be.equal(nextResponse);
            should(nextSearchResult.hits).be.equal(nextResponse.hits);
            should(nextSearchResult.aggregations).equal(nextResponse.aggregations);
          });
      });
    });

    describe('#with size and sort option', () => {
      let nextResponse;

      beforeEach(() => {
        nextResponse = {
          hits: [
            {_id: 'document3', _score: 0.6543, _source: {foo: 'barbaz', bar: 4567}},
            {_id: 'document4', _score: 0.6123, _source: {foo: 'bazbar', bar: 6789}}
          ],
          aggregations: 'nextAggregations',
          total: 30
        };

        request.size = 2;
        request.body.sort = ['foo', {bar: 'asc'}, {_uid: 'desc'}];

        response = {
          hits: [
            {_id: 'document1', _score: 0.9876, _source: {foo: 'bar', bar: 1234}},
            {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar', bar: 2345}}
          ],
          aggregations: 'aggregations',
          total: 30
        };
        searchResult = new DocumentSearchResult(kuzzle, request, options, response);

        kuzzle.query.resolves({result: nextResponse});
      });

      it('should call document/search action with search_after parameter and resolve to a new DocumentSearchResult', () => {
        return searchResult.next()
          .then(nextSearchResult => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                index: 'index',
                collection: 'collection',
                body: {
                  query: {
                    foo: 'bar'
                  },
                  sort: ['foo', {bar: 'asc'}, {_uid: 'desc'}],
                  search_after: ['barbar', 2345, 'collection#document2']
                },
                controller: 'document',
                action: 'search',
                size: 2
              }, options);
            should(nextSearchResult).not.be.equal(searchResult);
            should(nextSearchResult).be.instanceOf(DocumentSearchResult);
          });
      });

      it('should set the response and increment the "fetched" property', () => {
        should(searchResult.fetched).be.equal(2);
        should(searchResult._response).be.equal(response);
        should(searchResult.aggregations).equal(response.aggregations);
        return searchResult.next()
          .then(nextSearchResult => {
            should(nextSearchResult.fetched).be.equal(4);
            should(nextSearchResult._response).be.equal(nextResponse);
            should(nextSearchResult.hits).be.equal(nextResponse.hits);
            should(nextSearchResult.aggregations).equal(nextResponse.aggregations);
          });
      });

      it('should reject with an error if the sort is invalid', () => {
        request.body.sort = [];
        searchResult = new DocumentSearchResult(kuzzle, request, options, response);

        return should(searchResult.next())
          .be.rejected();
      });

      it('should reject if the sort combination does not allow to retrieve all the documents', () => {
        response.hits = [];
        searchResult = new DocumentSearchResult(kuzzle, request, options, response);

        return should(searchResult.next())
          .be.rejected();
      });
    });

    describe('#with from and size option', () => {
      const nextResponse = {
        hits: [
          {_id: 'document3', _score: 0.6543, _source: {foo: 'barbaz', bar: 4567}},
          {_id: 'document4', _score: 0.6123, _source: {foo: 'bazbar', bar: 6789}}
        ],
        aggregations: 'nextAggregations',
        total: 30
      };

      beforeEach(() => {
        request.size = 2;
        request.from = 2;

        response = {
          hits: [
            {_id: 'document1', _score: 0.9876, _source: {foo: 'bar', bar: 1234}},
            {_id: 'document2', _score: 0.6789, _source: {foo: 'barbar', bar: 2345}}
          ],
          aggregations: 'aggregations',
          total: 30
        };
        searchResult = new DocumentSearchResult(kuzzle, request, options, response);

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


      it('should call document/search action with from/size parameters and resolve to a new DocumentSearchResult', () => {
        return searchResult.next()
          .then(nextSearchResult => {
            should(kuzzle.query)
              .be.calledOnce()
              .be.calledWith({
                index: 'index',
                collection: 'collection',
                body: { query: { foo: 'bar' } },
                controller: 'document',
                action: 'search',
                size: 2,
                from: 2
              }, options);
            should(nextSearchResult).not.be.equal(searchResult);
            should(nextSearchResult).be.instanceOf(DocumentSearchResult);
          });
      });

      it('should set the response and increment the "fetched" property', () => {
        should(searchResult.fetched).be.equal(2);
        should(searchResult._response).be.equal(response);
        should(searchResult.aggregations).be.equal(response.aggregations);
        return searchResult.next()
          .then(nextSearchResult => {
            should(nextSearchResult.fetched).be.equal(4);
            should(nextSearchResult._response).be.equal(nextResponse);
            should(nextSearchResult.hits).be.equal(nextResponse.hits);
            should(nextSearchResult.aggregations).equal(nextResponse.aggregations);
          });
      });
    });
  });
});
