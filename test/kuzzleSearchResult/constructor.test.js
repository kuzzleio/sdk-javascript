var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  Document = require('../../src/Document'),
  KuzzleSearchResult = rewire('../../src/kuzzleSearchResult');

describe('Document constructor', function () {
  var
    kuzzle,
    searchArgs,
    document,
    aggregations,
    dataCollection;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    searchArgs = {options: {}, filters: {from:0, size: 1}};
    dataCollection = kuzzle.collection('foo');
    document = new Document(dataCollection, 'banana', {foo: 'bar'});
    aggregations = {};
  });

  it('should handle provided arguments correctly', function () {
    var searchResult = new KuzzleSearchResult(dataCollection, 2, [document], aggregations, searchArgs);

    should(searchResult).be.instanceof(KuzzleSearchResult);
    should(searchResult.total).be.exactly(2);
    should(searchResult.documents).be.an.Array();
    should(searchResult.documents[0]).be.deepEqual(document);
    should(searchResult.searchArgs).be.deepEqual(searchArgs);
    should(searchResult.fetchedDocument).be.deepEqual(1);
    should(searchResult._previous).be.exactly(null);
    should(searchResult._next).be.exactly(null);
  });

  it('should expose documented properties with the right permissions', function () {
    var searchResult = new KuzzleSearchResult(dataCollection, 2, [document], aggregations, searchArgs);

    should(searchResult).have.propertyWithDescriptor('dataCollection', { enumerable: false, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('total', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('documents', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('searchArgs', { enumerable: true, writable: false, configurable: false });
    should(searchResult).have.propertyWithDescriptor('fetchedDocument', { enumerable: true, writable: true, configurable: false });
    should(searchResult).have.propertyWithDescriptor('_previous', { enumerable: false, writable: true, configurable: false });
    should(searchResult).have.propertyWithDescriptor('_next', { enumerable: false, writable: true, configurable: false });
  });

  it('should promisify the right functions', function () {
    var searchResult = new KuzzleSearchResult(dataCollection, 2, [document], aggregations, searchArgs);

    should.exist(searchResult.nextPromise);
    should.exist(searchResult.previousPromise);
  });
});
