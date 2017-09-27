var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../src/Kuzzle'),
  CollectionMapping = require('../../src/CollectionMapping');

describe('CollectionMapping constructor', function () {
  var
    kuzzle,
    collection;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual', defaultIndex: 'bar'});
    collection = kuzzle.collection('foo');
  });

  it('should create a new instance even if no mapping has been provided', function () {
    var mapping = new CollectionMapping(collection);
    should(mapping.mapping).be.an.Object().and.be.empty();
  });

  it('should take mappings from arguments if provided', function () {
    var
      mappings = { foo: {type: 'string'}, bar: {type: 'float'}},
      mapping = new CollectionMapping(collection, mappings);

    should(mapping.mapping).match(mappings);
  });

  it('should expose documented properties with the right permissions', function () {
    var mapping = new CollectionMapping(collection);

    should(mapping).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
    should(mapping).have.propertyWithDescriptor('mapping', { enumerable: true, writable: true, configurable: false });
  });

  it('should initialize headers coming from the provided data collection object', function () {
    var
      headers = {foo: 'bar'},
      mapping;

    collection.headers = headers;
    mapping = new CollectionMapping(collection);
    should(mapping.headers).match(headers);
  });

  it('should promisify the right functions', function () {
    var
      mapping;

    kuzzle.bluebird = bluebird;
    mapping = new CollectionMapping(kuzzle.collection('foo'));

    should.exist(mapping.applyPromise);
    should.exist(mapping.refreshPromise);
    should.not.exist(mapping.setPromise);
    should.not.exist(mapping.setHeadersPromise);
  });
});
