var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/Kuzzle'),
  Document = require('../../src/Document'),
  SearchResult = rewire('../../src/SearchResult');

describe('SearchResult methods', function () {
  var
    kuzzle,
    collection,
    firstDocument,
    secondDocument,
    searchArgs;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    searchArgs = {options: {from:0, size: 1}, filters: {}};
    collection = kuzzle.collection('foo');
    firstDocument = new Document(collection, 'banana', {foo: 'bar'});
    secondDocument = new Document(collection, 'papagayo', {foo: 'bar'});
  });

  describe('#fetchNext', function () {
    it('should be able to do a scroll request', function (done) {
      var
        mockScrollResult = new SearchResult(
          collection,
          1,
          [new Document(collection, 'papagayo', {foo: 'bar'})],
          {},
          {options: {scrollId: 'papagayo', scroll: '1m', from: 0, size: 1}}
        ),
        firstSearchResult;

      collection.scroll = function(scrollId, scroll, options, filters, cb) {
        cb(null, mockScrollResult);
      };

      searchArgs.options.scrollId = 'banana';
      searchArgs.options.scroll = '1m';

      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, searchArgs);

      firstSearchResult.fetchNext(function(error, result) {
        console.log(error);
        should(result).be.an.instanceOf(SearchResult);
        should(result.getDocuments()).be.an.Array();
        should(result.getDocuments().length).be.exactly(1);
        done();
      });
    });

    it('should transfer error if not-able to do a scroll request', function (done) {
      var
        firstSearchResult;

      collection.scroll = function(scrollId, scroll, options, filters, cb) {
        cb(new Error('foobar scroll'));
      };

      searchArgs.options.scrollId = 'banana';
      searchArgs.options.scroll = '1m';

      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, searchArgs);

      firstSearchResult.fetchNext(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('foobar scroll');
        done();
      });
    });

    it('should be able to do a from / next search request', function (done) {
      var
        firstSearchResult;

      collection.search = function(filters, options, cb) {
        cb(null, new SearchResult(collection, 2, [secondDocument], {}, {options: options, filters: filters}));
      };

      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, searchArgs);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.an.instanceOf(SearchResult);
        should(result.documents).be.an.Array();
        should(result.documents.length).be.exactly(1);
        should(result.searchArgs.options.from).be.exactly(1);
        done();
      });
    });

    it('should transfer error if not-able to do a from / next search request', function (done) {
      var
        firstSearchResult;

      collection.search = function(filters, options, cb) {
        cb(new Error('foobar search'));
      };

      firstSearchResult = new SearchResult(collection, 2, [firstDocument], {}, searchArgs);

      firstSearchResult.fetchNext(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('foobar search');
        done();
      });
    });

    it('should be resolve null if all documents is fetched', function (done) {
      var
        firstSearchResult = new SearchResult(collection, 1, [firstDocument], {}, searchArgs);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.null();
        done();
      });
    });

    it('should be resolve null if all documents is fetched with scroll', function (done) {
      var
        firstSearchResult;

      searchArgs.options.scrollId = 'banana';
      searchArgs.options.scroll = '1m';

      firstSearchResult = new SearchResult(collection, 1, [firstDocument], {}, searchArgs);

      firstSearchResult.fetchNext(function(error, result) {
        should(result).be.null();
        done();
      });
    });

    it('should raise an error if no from/next/scroll search params has been set', function (done) {
      var
        firstSearchResult;

      searchArgs.options = {};

      firstSearchResult = new SearchResult(collection, 1, [firstDocument], {}, searchArgs);

      firstSearchResult.fetchNext(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('Unable to retrieve next results from search: missing scrollId or from/size params');
        done();
      });
    });
  });
});
