var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/Kuzzle'),
  Document = require('../../src/Document'),
  KuzzleSearchResult = rewire('../../src/SearchResult');

describe('KuzzleSearchResult methods', function () {
  var
    kuzzle,
    dataCollection,
    firstDocument,
    secondDocument,
    searchArgs;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    searchArgs = {options: {from:0, size: 1}, filters: {}};
    dataCollection = kuzzle.collection('foo');
    firstDocument = new Document(dataCollection, 'banana', {foo: 'bar'});
    secondDocument = new Document(dataCollection, 'papagayo', {foo: 'bar'});
  });

  describe('#next', function () {
    it('should return the next SearchResult if it has already fetched', function (done) {
      var
        firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], {}, searchArgs),
        secondSearchResult = new KuzzleSearchResult(dataCollection, 2, [secondDocument], {}, searchArgs, firstSearchResult);

      firstSearchResult.next(function(error, next) {
        should(error).be.exactly(null);
        should(next).be.exactly(secondSearchResult);
        done();
      });

    });

    it('should be able to do a scroll request', function (done) {
      var
        mockScrollResult = new KuzzleSearchResult(
          dataCollection,
          1,
          [new Document(dataCollection, 'papagayo', {foo: 'bar'})],
          {},
          {options: {scrollId: 'papagayo', from: 0, size: 1}}
        ),
        firstSearchResult;

      dataCollection.scroll = function(scrollId, options, filters, cb) {
        cb(null, mockScrollResult);
      };

      searchArgs.options.scrollId = 'banana';

      firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], {}, searchArgs);

      firstSearchResult.next(function(error, result) {
        should(result).be.an.instanceOf(KuzzleSearchResult);
        should(result.documents).be.an.Array();
        should(result.documents.length).be.exactly(1);
        should(result._previous).be.exactly(firstSearchResult);
        done();
      });
    });

    it('should transfer error if not-able to do a scroll request', function (done) {
      var
        firstSearchResult;

      dataCollection.scroll = function(scrollId, options, filters, cb) {
        cb(new Error('foobar scroll'));
      };

      searchArgs.options.scrollId = 'banana';

      firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], {}, searchArgs);

      firstSearchResult.next(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('foobar scroll');
        done();
      });
    });

    it('should be able to do a from / next search request', function (done) {
      var
        firstSearchResult;

      dataCollection.search = function(filters, options, cb) {
        cb(null, new KuzzleSearchResult(dataCollection, 2, [secondDocument], {}, {options: options, filters: filters}));
      };

      firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], {}, searchArgs);

      firstSearchResult.next(function(error, result) {
        should(result).be.an.instanceOf(KuzzleSearchResult);
        should(result.documents).be.an.Array();
        should(result.documents.length).be.exactly(1);
        should(result.searchArgs.options.from).be.exactly(1);
        done();
      });
    });

    it('should transfer error if not-able to do a from / next search request', function (done) {
      var
        firstSearchResult;

      dataCollection.search = function(filters, options, cb) {
        cb(new Error('foobar search'));
      };

      firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], {}, searchArgs);

      firstSearchResult.next(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('foobar search');
        done();
      });
    });

    it('should be resolve null if all documents is fetched', function (done) {
      var
        firstSearchResult = new KuzzleSearchResult(dataCollection, 1, [firstDocument], {}, searchArgs);

      firstSearchResult.next(function(error, result) {
        should(result).be.null();
        done();
      });
    });

    it('should be resolve null if all documents is fetched with scroll', function (done) {
      var
        firstSearchResult;

      searchArgs.options.scrollId = 'banana';

      firstSearchResult = new KuzzleSearchResult(dataCollection, 1, [firstDocument], {}, searchArgs);

      firstSearchResult.next(function(error, result) {
        should(result).be.null();
        done();
      });
    });

    it('should raise an error if no from/next/scroll search params has been set', function (done) {
      var
        firstSearchResult;

      searchArgs.options = {};

      firstSearchResult = new KuzzleSearchResult(dataCollection, 1, [firstDocument], {}, searchArgs);

      firstSearchResult.next(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('Unable to retrieve next results from search: missing scrollId or from/size params');
        done();
      });
    });
  });

  describe('#previous', function () {
    it('should call the callback with the previous SearchResult', function (done) {
      var
        firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], {}, searchArgs),
        secondSearchResult = new KuzzleSearchResult(dataCollection, 2, [secondDocument], {}, searchArgs, firstSearchResult);

      secondSearchResult.previous(function(error, previous) {
        should(error).be.exactly(null);
        should(previous).be.exactly(firstSearchResult);
        done();
      });
    });
  });
});
