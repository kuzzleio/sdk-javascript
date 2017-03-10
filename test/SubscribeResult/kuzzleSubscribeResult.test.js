var
  should = require('should'),
  SubscribeResult = require('../../src/SubscribeResult');

describe('KuzzleSubscribeResult object', function () {
  var ksr;

  beforeEach(function () {
    ksr = new SubscribeResult();
  });

  it('should expose the right prototypes', function() {
    should(ksr.onDone).be.a.Function();
    should(ksr.done).be.a.Function();
  });

  it('should register a callback and return itself on a onDone call', function () {
    var cb = function () {};

    should(ksr.onDone(cb)).be.eql(ksr);
    should(ksr.onDone(cb)).be.eql(ksr);
    should(ksr.onDone(cb)).be.eql(ksr);

    should(ksr.cbs).have.length(3);
    ksr.cbs.forEach(function (foo) {
      should(foo).be.eql(cb);
    });
  });

  it('should call all callbacks on a done call', function (done) {
    var
      count = 0,
      cb = function (err, res) {
        count++;
        should(err).be.eql(foo);
        should(res).be.eql(bar);
        should(ksr.error).be.eql(err);
        should(ksr.room).be.eql(res);
        if (count === 3) {
          done();
        }
      },
      foo = 'bar',
      bar = 'baz';

    this.timeout(50);

    ksr.onDone(cb);
    ksr.onDone(cb);
    ksr.onDone(cb);

    ksr.done(foo, bar);
  });

  it('should invoke the provided callback directly if Kuzzle response is already stored', function (done) {
    var
      cb = function (err, res) {
        should(err).be.eql('foo');
        should(res).be.eql('bar');
        should(ksr.cbs).be.empty();
        done();
      };

    this.timeout(50);

    ksr.error = 'foo';
    ksr.room = 'bar';

    ksr.onDone(cb);
  });
});

