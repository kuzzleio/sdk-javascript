var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataCollection = rewire('../../src/kuzzleDataCollection');

describe('KuzzleDataCollection constructor', function () {
  it('should initialize properties and return a valid KuzzleDataCollection object', function () {
    var
      kuzzle = new Kuzzle('foo'),
      collection = 'foobar',
      c;

    kuzzle.headers.some = 'headers';
    c = new KuzzleDataCollection(kuzzle, collection);

    // the collection "headers" should be a hard copy of the kuzzle ones
    kuzzle.headers = { someother: 'headers' };

    should(c).be.instanceof(KuzzleDataCollection);
    should(c).have.propertyWithDescriptor('collection', { enumerable: true, writable: false, configurable: false });
    should(c).have.propertyWithDescriptor('kuzzle', { enumerable: true, writable: false, configurable: false });
    should(c).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
    should(c.collection).be.exactly(collection);
    should(c.kuzzle).be.exactly(kuzzle);
    should(c.headers.some).be.exactly('headers');
    should(c.headers.someother).be.undefined();
  });

  it('should promisify the right functions', () => {
    var
      kuzzle,
      dataCollection;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('foo');
    dataCollection = new KuzzleDataCollection(kuzzle, 'foo');

    should.exist(dataCollection.advancedSearchPromise);
    should.exist(dataCollection.countPromise);
    should.exist(dataCollection.createPromise);
    should.exist(dataCollection.createDocumentPromise);
    should.exist(dataCollection.deletePromise);
    should.exist(dataCollection.deleteDocumentPromise);
    should.exist(dataCollection.fetchDocumentPromise);
    should.exist(dataCollection.fetchAllDocumentsPromise);
    should.exist(dataCollection.getMappingPromise);
    should.not.exist(dataCollection.publishPromise);
    should.exist(dataCollection.replaceDocumentPromise);
    should.not.exist(dataCollection.setHeadersPromise);
    should.not.exist(dataCollection.subscribePromise);
    should.exist(dataCollection.truncatePromise);
    should.exist(dataCollection.updateDocumentPromise);
  });

  it('should set headers using setHeaders', function () {
    var
      kuzzle = new Kuzzle('foo'),
      collection = kuzzle.dataCollectionFactory('foo');

    collection.setHeaders({foo: 'bar'}, true);
    should(collection.headers).match({foo: 'bar'});

    collection.setHeaders({bar: 'foobar'}, false);
    should(collection.headers).match({foo: 'bar', bar: 'foobar'});
  });
});