var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataValidation = rewire('../../src/kuzzleDataValidation');

describe('KuzzleDataValidation constructor', function () {
  var
    kuzzle,
    collection;

  before(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  });

  beforeEach(function () {
    collection = kuzzle.dataCollectionFactory('foo');
  });

  it('should create a new instance even if no specification has been provided', function () {
    var validation = new KuzzleDataValidation(collection);
    should(validation.specifications).be.an.Object().and.be.empty();
  });

  it('should take validations from arguments if provided', function () {
    var
      specifications = { foo: {type: 'string'}, bar: {type: 'float'}},
      validation = new KuzzleDataValidation(collection, specifications);

    should(validation.specifications).match(specifications);
  });

  it('should expose documented properties with the right permissions', function () {
    var validation = new KuzzleDataValidation(collection);

    should(validation).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
    should(validation).have.propertyWithDescriptor('specifications', { enumerable: true, writable: true, configurable: false });
  });

  it('should initialize headers coming from the provided data collection object', function () {
    var
      headers = {foo: 'bar'},
      validation;

    collection.headers = headers;
    validation = new KuzzleDataValidation(collection);
    should(validation.headers).match(headers);
  });

  it('should promisify the right functions', function () {
    var
      validation;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    validation = new KuzzleDataValidation(kuzzle.dataCollectionFactory('foo'));

    should.exist(validation.applyPromise);
    should.exist(validation.refreshPromise);
    should.exist(validation.deletePromise);
    should.exist(validation.validatePromise);
    should.not.exist(validation.setHeadersPromise);
  });
});
