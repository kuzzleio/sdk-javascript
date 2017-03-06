var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/Kuzzle'),
  Document = require('../../src/Document'),
  SearchResult = rewire('../../src/SearchResult');

describe('SearchResult constructor', function () {
  var
    kuzzle,
    searchArgs,
    document,
    aggregations,
    collection;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    searchArgs = {options: {}, filters: {from:0, size: 1}};
    collection = kuzzle.collection('foo');
    document = new Document(collection, 'banana', {foo: 'bar'});
    aggregations = {foo: 'bar'};
  });

  it('should handle provided arguments correctly and define proper getters', function () {
    var searchResult = new SearchResult(collection, 2, [document], aggregations, searchArgs);

    should(searchResult).be.instanceof(SearchResult);
    should(searchResult.collection).be.exactly(collection);
    should(searchResult.getCollection()).be.exactly(collection);
    should(searchResult.total).be.exactly(2);
    should(searchResult.getTotal()).be.exactly(2);
    should(searchResult.documents).be.an.Array();
    should(searchResult.getDocuments()).be.an.Array();
    should(searchResult.documents[0]).be.deepEqual(document);
    should(searchResult.getDocuments()[0]).be.deepEqual(document);
    should(searchResult.searchArgs).be.deepEqual(searchArgs);
    should(searchResult.getSearchArgs()).be.deepEqual(searchArgs);
    should(searchResult.aggregations).be.deepEqual(aggregations);
    should(searchResult.getAggregations()).be.deepEqual(aggregations);
    should(searchResult.fetchedDocument).be.deepEqual(1);
    should(searchResult.getFetchedDocument()).be.deepEqual(1);
  });

  it('should expose documented properties with the right permissions', function () {
    var searchResult = new SearchResult(collection, 2, [document], aggregations, searchArgs);

    should(searchResult).have.propertyWithDescriptor('collection', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('total', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('documents', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('searchArgs', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('fetchedDocument', { enumerable: true, writable: true, configurable: false });
  });

  it('should promisify the right functions', function () {
    var searchResult = new SearchResult(collection, 2, [document], aggregations, searchArgs);

    should.exist(searchResult.fetchNextPromise);
  });
});
