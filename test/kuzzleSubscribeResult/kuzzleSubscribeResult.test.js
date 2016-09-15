var
  should = require('should'),
  KuzzleSubscribeResult = require('../../src/kuzzleSubscribeResult');

describe('KuzzleSubscribeResult object', function () {
  var ksr;

  beforeEach(function () {
    ksr = new KuzzleSubscribeResult();
  });

  it('should expose the right prototypes', function() {
    should(ksr.onSuccess).be.a.Function();
    should(ksr.onError).be.a.Function();
    should(ksr.success).be.a.Function();
    should(ksr.error).be.a.Function();
  });

  it('should register a callback and return itself on a onSuccess call', function () {
    var cb = function () {};

    should(ksr.onSuccess(cb)).be.eql(ksr);
    should(ksr.onSuccess(cb)).be.eql(ksr);
    should(ksr.onSuccess(cb)).be.eql(ksr);

    should(ksr.onSuccessCB).have.length(3);
    ksr.onSuccessCB.forEach(function (foo) {
      should(foo).be.eql(cb);
    });
  });

  it('should register a callback and return itself on a onError call', function () {
    var cb = function () {};

    should(ksr.onError(cb)).be.eql(ksr);
    should(ksr.onError(cb)).be.eql(ksr);
    should(ksr.onError(cb)).be.eql(ksr);

    should(ksr.onErrorCB).have.length(3);
    ksr.onErrorCB.forEach(function (foo) {
      should(foo).be.eql(cb);
    });
  });

  it('should call all error callbacks on a success call', function (done) {
    var
      count = 0,
      cb = function (arg) {
        count++;
        should(arg).be.eql(foo);
        if (count === 3) {
          done();
        }
      },
      foo = 'bar';

    this.timeout(50);

    ksr.onSuccess(cb);
    ksr.onSuccess(cb);
    ksr.onSuccess(cb);

    ksr.success(foo);
  });

  it('should call all success callbacks on an error call', function (done) {
    var
      count = 0,
      cb = function (arg) {
        count++;
        should(arg).be.eql(foo);
        if (count === 3) {
          done();
        }
      },
      foo = 'bar';

    this.timeout(50);

    ksr.onError(cb);
    ksr.onError(cb);
    ksr.onError(cb);

    ksr.error(foo);
  });
});

