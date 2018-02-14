var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../src/Kuzzle'),
  Collection = require('../../src/Collection.js');

describe('Collection constructor', function () {
  it('should initialize properties and return a valid Collection object', function () {
    var
      kuzzle = new Kuzzle('foo'),
      index = 'barfoo',
      collectionName = 'foobar',
      c;

    c = new Collection(kuzzle, collectionName, index);

    should(c).be.instanceof(Collection);
    should(c).have.propertyWithDescriptor('index', { enumerable: true, writable: false, configurable: false });
    should(c).have.propertyWithDescriptor('collection', { enumerable: true, writable: false, configurable: false });
    should(c).have.propertyWithDescriptor('kuzzle', { enumerable: true, writable: false, configurable: false });
    should(c.index).be.exactly(index);
    should(c.collection).be.exactly(collectionName);
    should(c.kuzzle).be.exactly(kuzzle);
  });

  it('should promisify the right functions', function () {
    var
      kuzzle,
      collection;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('foo');
    collection = new Collection(kuzzle, 'bar', 'foo');

    should.exist(collection.countPromise);
    should.exist(collection.createPromise);
    should.exist(collection.deleteDocumentPromise);
    should.exist(collection.deleteSpecificationsPromise);
    should.exist(collection.documentExistsPromise);
    should.exist(collection.fetchDocumentPromise);
    should.exist(collection.getMappingPromise);
    should.exist(collection.getSpecificationsPromise);
    should.exist(collection.mCreateDocumentPromise);
    should.exist(collection.mCreateOrReplaceDocumentPromise);
    should.exist(collection.mDeleteDocumentPromise);
    should.exist(collection.mGetDocumentPromise);
    should.exist(collection.mReplaceDocumentPromise);
    should.exist(collection.mUpdateDocumentPromise);
    should.exist(collection.publishMessagePromise);
    should.exist(collection.scrollSpecificationsPromise);
    should.exist(collection.searchSpecificationsPromise);
    should.not.exist(collection.subscribePromise);
    should.exist(collection.truncatePromise);
    should.exist(collection.updateSpecificationsPromise);
    should.exist(collection.validateSpecificationsPromise);
  });

  it('should throw an error if no collection or no index is provided', function () {
    var kuzzle = new Kuzzle('foo');

    should((function () { new Collection(kuzzle);})).throw();
    should((function () { new Collection(kuzzle, 'foo');})).throw();
  });
});
