var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/Kuzzle'),
  Document = rewire('../../src/Document');

describe('Document constructor', function () {
  var
    kuzzle,
    refreshed = false,
    collection;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    kuzzle.query = function () {
      var cb = arguments[arguments.length - 1];

      cb(null, {_source: {some: 'content'}, _version: 42});
      refreshed = true;
    };
    refreshed = false;
    collection = kuzzle.collection('foo');
  });

  it('should handle provided arguments correctly', function () {
    var document = new Document(collection);

    should(document).be.instanceof(Document);
    should(refreshed).be.false();
    should(document.id).be.undefined();
    should(document.content).be.empty();
    should(document.version).be.undefined();
    should(document.collection).be.exactly('foo');

    document = new Document(collection, { some: 'content' });
    should(refreshed).be.false();
    should(document.id).be.undefined();
    should(document.content).match({some: 'content'});
    should(document.version).be.undefined();
    should(document.collection).be.exactly('foo');

    document = new Document(collection, 'id', { some: 'content', _version: 123 });
    should(refreshed).be.false();
    should(document.id).be.exactly('id');
    should(document.content).match({some: 'content'});
    should(document.version).be.exactly(123);
    should(document.collection).be.exactly('foo');

    document = new Document(collection, 'id');
    should(refreshed).be.false();
    should(document.id).be.exactly('id');
    should(document.content).be.empty();
    should(document.version).be.undefined();
    should(document.collection).be.exactly('foo');
  });

  it('should expose documented properties with the right permissions', function () {
    var document = new Document(collection);

    should(document).have.propertyWithDescriptor('collection', { enumerable: true, writable: false, configurable: false });
    should(document).have.propertyWithDescriptor('content', { enumerable: true, writable: true, configurable: false });
    should(document).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
    should(document).have.propertyWithDescriptor('id', { enumerable: true, writable: true, configurable: false });
    should(document).have.propertyWithDescriptor('version', { enumerable: true, writable: true, configurable: false });
  });

  it('should promisify the right functions', function () {
    var document = new Document(collection);

    should.exist(document.deletePromise);
    should.not.exist(document.publishPromise);
    should.exist(document.refreshPromise);
    should.exist(document.savePromise);
    should.not.exist(document.setContentPromise);
    should.not.exist(document.setHeadersPromise);
    should.not.exist(document.subscribePromise);
  });
});
