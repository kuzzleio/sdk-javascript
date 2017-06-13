var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../src/Kuzzle'),
  Collection = require('../../src/Collection.js');

describe('Collection constructor', function () {
  it('should initialize properties and return a valid Collection object', function () {
    var
      kuzzle = new Kuzzle('foo', {connect: 'manual'}),
      index = 'barfoo',
      collectionName = 'foobar',
      c;

    kuzzle.headers.some = 'headers';
    c = new Collection(kuzzle, collectionName, index);

    // the collection "headers" should be a hard copy of the kuzzle ones
    kuzzle.headers = { someother: 'headers' };

    should(c).be.instanceof(Collection);
    should(c).have.propertyWithDescriptor('index', { enumerable: true, writable: false, configurable: false });
    should(c).have.propertyWithDescriptor('collection', { enumerable: true, writable: false, configurable: false });
    should(c).have.propertyWithDescriptor('kuzzle', { enumerable: true, writable: false, configurable: false });
    should(c).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
    should(c.index).be.exactly(index);
    should(c.collection).be.exactly(collectionName);
    should(c.kuzzle).be.exactly(kuzzle);
    should(c.headers.some).be.exactly('headers');
    should(c.headers.someother).be.undefined();
  });

  it('should promisify the right functions', function () {
    var
      kuzzle,
      collection;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    collection = new Collection(kuzzle, 'bar', 'foo');

    should.exist(collection.countPromise);
    should.exist(collection.createPromise);
    should.exist(collection.createDocumentPromise);
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
    should.not.exist(collection.publishPromise);
    should.exist(collection.replaceDocumentPromise);
    should.exist(collection.scrollSpecificationsPromise);
    should.exist(collection.searchSpecificationsPromise);
    should.not.exist(collection.setHeadersPromise);
    should.not.exist(collection.subscribePromise);
    should.exist(collection.truncatePromise);
    should.exist(collection.updateDocumentPromise);
    should.exist(collection.updateSpecificationsPromise);
    should.exist(collection.validateSpecificationsPromise);
  });

  it('should set headers using setHeaders', function () {
    var
      kuzzle = new Kuzzle('foo', {connect: 'manual'}),
      collection = kuzzle.collection('foo', 'bar');

    collection.setHeaders({foo: 'bar'}, true);
    should(collection.headers).match({foo: 'bar'});

    collection.setHeaders({bar: 'foobar'}, false);
    should(collection.headers).match({foo: 'bar', bar: 'foobar'});
  });

  it('should throw an error if no collection or no index is provided', function () {
    var kuzzle = new Kuzzle('foo', {connect: 'manual'});

    should((function () { new Collection(kuzzle);})).throw();
    should((function () { new Collection(kuzzle, 'foo');})).throw();
  });
});
