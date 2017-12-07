var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../src/Kuzzle'),
  Document = require('../../src/Document'),
  SearchResult = require('../../src/SearchResult');

describe('SearchResult constructor', function () {
  var
    kuzzle,
    searchOptions,
    searchFilters,
    document,
    aggregations,
    collection;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    searchOptions = {from:0, size: 1};
    searchFilters = {};
    collection = kuzzle.collection('foo');
    document = new Document(collection, 'banana', {foo: 'bar'});
    aggregations = {foo: 'bar'};
  });

  it('should handle provided arguments correctly and define proper getters', function () {
    var searchResult = new SearchResult(collection, 2, [document], aggregations, searchOptions, searchFilters);

    should(searchResult).be.instanceof(SearchResult);
    should(searchResult.collection).be.exactly(collection);
    should(searchResult.getCollection()).be.exactly(collection);
    should(searchResult.total).be.exactly(2);
    should(searchResult.getTotal()).be.exactly(2);
    should(searchResult.documents).be.an.Array();
    should(searchResult.getDocuments()).be.an.Array();
    should(searchResult.documents[0]).be.deepEqual(document);
    should(searchResult.getDocuments()[0]).be.deepEqual(document);
    should(searchResult.options).be.deepEqual(searchOptions);
    should(searchResult.getOptions()).be.deepEqual(searchOptions);
    should(searchResult.filters).be.deepEqual(searchFilters);
    should(searchResult.getFilters()).be.deepEqual(searchFilters);
    should(searchResult.aggregations).be.deepEqual(aggregations);
    should(searchResult.getAggregations()).be.deepEqual(aggregations);
    should(searchResult.fetchedDocument).be.deepEqual(1);
    should(searchResult.getFetchedDocument()).be.deepEqual(1);
  });

  it('should expose documented properties with the right permissions', function () {
    var searchResult = new SearchResult(collection, 2, [document], aggregations, searchOptions, searchFilters);

    should(searchResult).have.propertyWithDescriptor('collection', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('total', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('documents', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('options', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('filters', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('fetchedDocument', { enumerable: true, writable: true, configurable: false });
  });

  it('should promisify the right functions', function () {
    var searchResult;

    kuzzle.bluebird = bluebird;
    searchResult = new SearchResult(collection, 2, [document], aggregations, searchOptions, searchFilters);

    should.exist(searchResult.fetchNextPromise);
  });
});
