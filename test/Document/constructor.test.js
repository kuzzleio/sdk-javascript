var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../src/Kuzzle'),
  Document = require('../../src/Document');

describe('Document constructor', function () {
  var
    kuzzle,
    collection;


  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual', defaultIndex: 'bar'});
    kuzzle.bluebird = bluebird;
    collection = kuzzle.collection('foo');
  });

  it('should handle provided arguments correctly', function () {
    var document = new Document(collection);

    should(document).be.instanceof(Document);
    should(document.id).be.undefined();
    should(document.content).be.empty();
    should(document.meta).be.empty();
    should(document.version).be.undefined();
    should(document.collection).be.exactly('foo');

    document = new Document(collection, { some: 'content' });
    should(document.id).be.undefined();
    should(document.content).match({some: 'content'});
    should(document.meta).be.empty();
    should(document.version).be.undefined();
    should(document.collection).be.exactly('foo');

    document = new Document(collection, 'id', { some: 'content', _version: 123 });
    should(document.id).be.exactly('id');
    should(document.content).match({some: 'content'});
    should(document.meta).be.empty();
    should(document.version).be.exactly(123);
    should(document.collection).be.exactly('foo');

    document = new Document(collection, 'id');
    should(document.id).be.exactly('id');
    should(document.content).be.empty();
    should(document.meta).be.empty();
    should(document.version).be.undefined();
    should(document.collection).be.exactly('foo');

    document = new Document(collection, 'id', { some: 'content', _version: 123 }, {author: 'toto'});
    should(document.id).be.exactly('id');
    should(document.content).match({some: 'content'});
    should(document.meta).match({author: 'toto'});
    should(document.version).be.exactly(123);
    should(document.collection).be.exactly('foo');
  });

  it('should expose documented properties with the right permissions', function () {
    var document = new Document(collection);

    should(document).have.propertyWithDescriptor('collection', { enumerable: true, writable: false, configurable: false });
    should(document).have.propertyWithDescriptor('content', { enumerable: true, writable: true, configurable: false });
    should(document).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
    should(document).have.propertyWithDescriptor('id', { enumerable: true, writable: true, configurable: false });
    should(document).have.propertyWithDescriptor('version', { enumerable: true, writable: true, configurable: false });
    should(document).have.propertyWithDescriptor('meta', { enumerable: true, writable: false, configurable: false });
  });

  it('should promisify the right functions', function () {
    var document = new Document(collection);

    should.exist(document.deletePromise);
    should.not.exist(document.existsPromise);
    should.not.exist(document.publishPromise);
    should.exist(document.refreshPromise);
    should.exist(document.savePromise);
    should.not.exist(document.setContentPromise);
    should.not.exist(document.setHeadersPromise);
    should.not.exist(document.subscribePromise);
  });
});
