var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle'),
  SearchResult = require('../../src/SearchResult');

describe('SearchResult methods', function () {
  var
    kuzzle,
    collection,
    firstResultSet,
    secondResultSet,
    searchOptions,
    searchFilters;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo');
    kuzzle.query = sinon.stub();
    searchOptions = {from:0, size: 1};
    searchFilters = {};
    collection = kuzzle.collection('foo', 'bar');
    firstResultSet = {
      result: {
        hits: [
          {_id: 'banana', _source: {foo: 'bar', bar: 'bazinga'}}
        ],
        total: 2
      }
    };
    secondResultSet = {
      result: {
        hits: [
          {_id: 'papagayo', _source: {foo: 'bar'}}
        ],
        total: 2
      }
    };
  });

  describe('#fetchNext', function () {
    beforeEach(function () {
      collection.scroll = sinon.stub();
    });

    it('should be able to perform a search-after request', function (done) {
      var firstSearchResult;

      searchFilters = {sort: [{foo: 'asc'}, 'bar']};

      this.timeout(50);

      collection.search = function(filters, options, cb) {
        should(filters.search_after).match(['bar', 'bazinga']);
        cb(null, new SearchResult(collection, searchFilters, searchOptions, secondResultSet));
      };

      firstSearchResult = new SearchResult(collection, searchFilters, searchOptions, firstResultSet);
      should(firstSearchResult.fetched).be.eql(1);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.an.instanceOf(SearchResult);
        should(result.documents).be.an.Array().and.have.length(1);
        should(result.fetched).be.eql(2);
        done();
      });
    });

    it('should transfer error if not able to do a search-after request', function (done) {
      var
        firstSearchResult;

      searchFilters = {sort: [{foo: 'asc'}]};

      collection.search = function(filters, options, cb) {
        cb(new Error('foobar search'));
      };

      firstSearchResult = new SearchResult(collection, searchFilters, searchOptions, firstResultSet);

      firstSearchResult.fetchNext(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('foobar search');
        done();
      });
    });

    it('should be able to do a scroll request', function (done) {
      var
        firstSearchResult;

      this.timeout(50);

      firstResultSet.result._scroll_id = 'banana';
      firstSearchResult = new SearchResult(collection, searchFilters, searchOptions, firstResultSet);
      should(firstSearchResult.fetched).be.eql(1);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.an.instanceOf(SearchResult);
        should(result.documents).be.an.Array().and.have.length(1);
        should(result.fetched).be.eql(2);
        done();
      });

      should(collection.scroll)
        .calledOnce()
        .and.calledWithMatch('banana', null, searchFilters, sinon.match.func);
      
      collection.scroll.yield(null, new SearchResult(collection, searchFilters, searchOptions, secondResultSet));
    });

    it('should transfer error if not able to do a scroll request', function (done) {
      var
        firstSearchResult;

      this.timeout(50);

      firstResultSet.result._scroll_id = 'banana';
      firstSearchResult = new SearchResult(collection, searchFilters, searchOptions, firstResultSet);
      should(firstSearchResult.fetched).be.eql(1);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.undefined();
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('foobar scroll');
        done();
      });

      collection.scroll.yield(new Error('foobar scroll'));
    });

    it('should be able to do a from / next search request', function (done) {
      var
        firstSearchResult;

      this.timeout(50);

      collection.search = function(filters, options, cb) {
        cb(null, new SearchResult(collection, searchFilters, options, secondResultSet));
      };

      firstSearchResult = new SearchResult(collection, searchFilters, searchOptions, firstResultSet);
      should(firstSearchResult.fetched).be.eql(1);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.an.instanceOf(SearchResult);
        should(result.documents).be.an.Array().and.have.length(1);
        should(result.options.from).be.exactly(1);
        should(result.fetched).be.eql(2);
        done();
      });
    });

    it('should transfer error if not able to do a from / next search request', function (done) {
      var
        firstSearchResult;

      collection.search = function(filters, options, cb) {
        cb(new Error('foobar search'));
      };

      firstSearchResult = new SearchResult(collection, searchFilters, searchOptions, firstResultSet);

      firstSearchResult.fetchNext(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('foobar search');
        done();
      });
    });

    it('should resolve to null if all documents have been fetched', function (done) {
      var
        firstSearchResult;

      firstResultSet.result.total = 1;
      firstSearchResult = new SearchResult(collection, searchFilters, searchOptions, firstResultSet);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.null();
        should(error).be.null();
        done();
      });
    });

    it('should raise an error if no from/next/scroll search params has been set', function (done) {
      var
        firstSearchResult;

      firstSearchResult = new SearchResult(collection, searchFilters, {}, firstResultSet);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.undefined();
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('Unable to retrieve next results from search: missing scrollId or from/size params');
        done();
      });
    });
  });
});
