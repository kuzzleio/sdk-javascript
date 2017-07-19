var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle'),
  Document = require('../../src/Document'),
  SearchResult = require('../../src/SearchResult');

describe('SearchResult methods', function () {
  var
    kuzzle,
    collection,
    firstDocument,
    secondDocument,
    searchOptions,
    searchFilters;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
    searchOptions = {from:0, size: 1};
    searchFilters = {};
    collection = kuzzle.collection('foo', 'bar');
    firstDocument = new Document(collection, 'banana', {foo: 'bar'});
    secondDocument = new Document(collection, 'papagayo', {foo: 'bar'});
  });

  describe('#fetchNext', function () {
    beforeEach(function () {
      collection.scroll = sinon.stub();
    });

    it('should be able to perform a search-after request', function (done) {
      var
        firstSearchResult;

      searchFilters = {sort: [{foo: 'asc'}]};

      this.timeout(50);

      collection.search = function(filters, options, cb) {
        cb(null, new SearchResult(collection, 2, [secondDocument], {}, {size: 1}, searchFilters));
      };

      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, {size: 1}, searchFilters);
      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.an.instanceOf(SearchResult);
        should(result.getDocuments()).be.an.Array();
        should(result.getDocuments().length).be.exactly(1);
        done();
      });
    });

    it('should transfer error if not-able to do a search-after request', function (done) {
      var
        firstSearchResult;

      searchFilters = {sort: [{foo: 'asc'}]};

      collection.search = function(filters, options, cb) {
        cb(new Error('foobar search'));
      };

      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, {size: 1}, searchFilters);

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

      searchOptions.scrollId = 'banana';
      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, searchOptions, searchFilters);
      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.an.instanceOf(SearchResult);
        should(result.getDocuments()).be.an.Array();
        should(result.getDocuments().length).be.exactly(1);
        done();
      });

      collection.scroll.yield(null, new SearchResult(
        collection,
        1,
        [new Document(collection, 'papagayo', {foo: 'bar'})],
        {},
        {options: {scrollId: 'papagayo', scroll: '1m', from: 0, size: 1}}
      ));
    });

    it('should transfer error if not-able to do a scroll request', function (done) {
      var
        firstSearchResult;

      this.timeout(50);

      searchOptions.scrollId = 'banana';
      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, searchOptions, searchFilters);
      firstSearchResult.fetchNext(function(error) {
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
        cb(null, new SearchResult(collection, 2, [secondDocument], {}, options, filters));
      };

      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, searchOptions, searchFilters);
      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.an.instanceOf(SearchResult);
        should(result.documents).be.an.Array();
        should(result.documents.length).be.exactly(1);
        should(result.options.from).be.exactly(1);
        done();
      });
    });

    it('should transfer error if not-able to do a from / next search request', function (done) {
      var
        firstSearchResult;

      collection.search = function(filters, options, cb) {
        cb(new Error('foobar search'));
      };

      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, searchOptions, searchFilters);

      firstSearchResult.fetchNext(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('foobar search');
        done();
      });
    });

    it('should be resolve null if all documents is fetched', function (done) {
      var
        firstSearchResult = new SearchResult(collection, 1, [firstDocument], {}, searchOptions, searchFilters);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.null();
        done();
      });
    });

    it('should be resolve null if all documents is fetched with scroll', function (done) {
      var
        firstSearchResult;

      searchOptions.scrollId = 'banana';
      searchOptions.scroll = '1m';

      firstSearchResult = new SearchResult(collection, 1, [firstDocument], {}, searchOptions, searchFilters);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.null();
        done();
      });
    });

    it('should raise an error if no from/next/scroll search params has been set', function (done) {
      var
        firstSearchResult;

      searchOptions = {};

      firstSearchResult = new SearchResult(collection, 1, [firstDocument], {}, searchOptions, searchFilters);

      firstSearchResult.fetchNext(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('Unable to retrieve next results from search: missing scrollId or from/size params');
        done();
      });
    });
  });
});
