var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../src/Kuzzle'),
  SearchResult = require('../../src/SearchResult');

describe('SearchResult constructor', function () {
  var
    kuzzle,
    searchOptions,
    searchFilters,
    searchRawResults,
    collection;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    searchOptions = {from:0, size: 1};
    searchFilters = {};
    searchRawResults = {
      result: {
        hits: [
          {_id: 'banana', _source: {foo: 'bar'}}
        ],
        total: 2,
        aggregations: {some: 'aggregations'},
        _scroll_id: 'foobar'
      }
    };
    collection = kuzzle.collection('foo');
  });

  it('should handle provided arguments correctly and define proper getters', function () {
    var searchResult = new SearchResult(collection, searchFilters, searchOptions, searchRawResults);

    should(searchResult).be.instanceof(SearchResult);
    should(searchResult.collection).be.exactly(collection);
    should(searchResult.total).be.exactly(2);
    should(searchResult.documents).be.an.Array().and.have.length(1);
    should(searchResult.documents[0].id).be.eql('banana');
    should(searchResult.documents[0].content).be.eql({foo: 'bar'});
    should(searchResult.options).match({from: 0, size: 1, scrollId: 'foobar'});
    should(searchResult.filters).be.deepEqual(searchFilters);
    should(searchResult.aggregations).match({some: 'aggregations'});
    should(searchResult.fetched).be.eql(1);
  });

  it('should expose documented properties with the right permissions', function () {
    var searchResult = new SearchResult(collection, searchFilters, searchOptions, searchRawResults);

    should(searchResult).have.propertyWithDescriptor('collection', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('total', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('documents', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('options', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('filters', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('fetched', { enumerable: true, writable: true, configurable: false });
  });

  it('should promisify the right functions', function () {
    var searchResult;

    kuzzle.bluebird = bluebird;
    searchResult = new SearchResult(collection, searchFilters, searchOptions, searchRawResults);

    should.exist(searchResult.fetchNextPromise);
  });
});
