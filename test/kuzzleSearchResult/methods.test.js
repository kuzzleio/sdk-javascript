var
  sinon = require('sinon'),
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDocument = require('../../src/kuzzleDocument'),
  KuzzleSearchResult = rewire('../../src/kuzzleSearchResult');

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
    searchArgs = {options: {}, filters: {from:0, size: 1}};
    dataCollection = kuzzle.dataCollectionFactory('foo');
    firstDocument = new KuzzleDocument(dataCollection, 'banana', {foo: 'bar'});
    secondDocument = new KuzzleDocument(dataCollection, 'papagayo', {foo: 'bar'});
  });

  describe('#next', function () {
    it('should return the next SearchResult if it has already fetched', function (done) {
      var
        firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], searchArgs),
        secondSearchResult = new KuzzleSearchResult(dataCollection, 2, [secondDocument], searchArgs, firstSearchResult);

      firstSearchResult.next(function(error, next) {
        should(error).be.exactly(null);
        should(next).be.exactly(secondSearchResult);
        done();
      });

    });

    it('should be able to do a scroll request', function (done) {
      var
        firstSearchResult;

      dataCollection.kuzzle.scroll = function(scrollId, options, cb) {
        cb(null, {
          result: {
            _scroll_id: 'papagayo',
            hits:  [{
              _id: 'papagayo',
              _source: {foo: 'bar'},
              _version: 1
            }]
          }
        });
      };

      searchArgs.filters.scrollId = 'banana';

      firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], searchArgs);

      firstSearchResult.next(function(error, result) {
        should(result).be.an.instanceOf(KuzzleSearchResult);
        should(result.documents).be.an.Array();
        should(result.documents.length).be.exactly(1);
        should(result._previous).be.exactly(firstSearchResult);
        done();
      });
    });

    it('should be able to do a from / next search request', function (done) {
      var
        firstSearchResult;

      dataCollection.search = function(filters, options, cb) {
        cb(null, new KuzzleSearchResult(dataCollection, 2, [secondDocument], {options: options, filters: filters}));
      };

      firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], searchArgs);

      firstSearchResult.next(function(error, result) {
        should(result).be.an.instanceOf(KuzzleSearchResult);
        should(result.documents).be.an.Array();
        should(result.documents.length).be.exactly(1);
        should(result.searchArgs.filters.from).be.exactly(1);
        done();
      });
    });

    it('should be resolve null if all documents is fetched', function (done) {
      var
        firstSearchResult = new KuzzleSearchResult(dataCollection, 1, [firstDocument], searchArgs);

      firstSearchResult.next(function(error, result) {
        should(result).be.null();
        done();
      });
    });

    it('should be resolve null if all documents is fetched with scroll', function (done) {
      var
        firstSearchResult;

      searchArgs.filters.scrollId = 'banana';

      firstSearchResult = new KuzzleSearchResult(dataCollection, 1, [firstDocument], searchArgs);

      firstSearchResult.next(function(error, result) {
        should(result).be.null();
        done();
      });
    });

    it('should raise an error if no from/next/scroll search params has been set', function (done) {
      var
        firstSearchResult;

      searchArgs.filters = {};

      firstSearchResult = new KuzzleSearchResult(dataCollection, 1, [firstDocument], searchArgs);

      firstSearchResult.next(function(error) {
        should(error).be.an.instanceOf(Error);
        should(error.message).be.exactly('Unable to retrieve next results from search: missing scrollId or from/size params');
        done();
      });
    });
  });

  describe('#previous', function () {
    it('should return the previous SearchResult if set', function () {
      var
        firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], searchArgs),
        secondSearchResult = new KuzzleSearchResult(dataCollection, 2, [secondDocument], searchArgs, firstSearchResult);

      should(secondSearchResult.previous()).be.exactly(firstSearchResult)
    });

    it('should call the callback with the previous SearchResult if callback is given', function (done) {
      var
        firstSearchResult = new KuzzleSearchResult(dataCollection, 2, [firstDocument], searchArgs),
        secondSearchResult = new KuzzleSearchResult(dataCollection, 2, [secondDocument], searchArgs, firstSearchResult);

      secondSearchResult.previous(function(error, previous) {
        should(error).be.exactly(null);
        should(previous).be.exactly(firstSearchResult);
        done();
      });
    });
  });
});
