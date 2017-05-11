var
  should = require('should'),
  bluebird = require('bluebird'),
  MemoryStorage = require('../../src/MemoryStorage'),
  Kuzzle = require('../../src/Kuzzle');

describe('MemoryStorage constructor', function () {
  it('should initialize properties and return a valid MemoryStorage object', function () {
    var
      kuzzle = new Kuzzle('foo', {connect: 'manual'}),
      ms;

    kuzzle.headers.some = 'headers';
    ms = new MemoryStorage(kuzzle);

    // the collection "headers" should be a hard copy of the kuzzle ones
    kuzzle.headers = { someother: 'headers' };

    should(ms).be.an.instanceOf(MemoryStorage);
    should(ms).have.propertyWithDescriptor('kuzzle', {enumerable: true, writable: false, configurable: false});
    should(ms).have.propertyWithDescriptor('headers', {enumerable: true, writable: true, configurable: false});
    should(ms.headers.some).be.exactly('headers');
    should(ms.headers.someother).be.undefined();
  });

  it('should promisify all methods', function () {
    var
      kuzzle,
      ms,
      functions;

    Kuzzle.prototype.bluebird = bluebird;

    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    ms = new MemoryStorage(kuzzle);

    functions = Object.getOwnPropertyNames(Object.getPrototypeOf(ms)).filter(function (p) {
      return (typeof ms[p] === 'function' && ['constructor', 'setHeaders'].indexOf(p) === -1);
    });

    should(functions.length).be.eql(117);

    functions.forEach(function (f) {
      should(ms[f + 'Promise']).be.a.Function();
    });

    delete Kuzzle.prototype.bluebird;
  });

  it('should set headers using setHeaders', function () {
    var
      kuzzle = new Kuzzle('foo', {connect: 'manual'}),
      ms = new MemoryStorage(kuzzle);

    ms.setHeaders({foo: 'bar'}, true);
    should(ms.headers).match({foo: 'bar'});

    ms.setHeaders({bar: 'foobar'}, false);
    should(ms.headers).match({foo: 'bar', bar: 'foobar'});
  });

  it('auto-generated functions should throw if the wrong number of parameters is provided', function () {
    var
      emptyFunc = function () {},
      kuzzle = new Kuzzle('foo', {connect: 'manual'}),
      ms = new MemoryStorage(kuzzle);

    should(function () {ms.dbsize('foo', {}, emptyFunc);}).throw('MemoryStorage.dbsize: Too many parameters provided');
    should(function () {ms.mget(emptyFunc);}).throw('MemoryStorage.mget: Missing parameter "keys"');
    should(function () {ms.ping(['foo', 'bar'], emptyFunc);}).throw('MemoryStorage.ping: Invalid optional parameter (expected an object)');
  });
});
