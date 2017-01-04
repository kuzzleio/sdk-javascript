var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/Kuzzle');

describe('Kuzzle.getStatistics', function () {
  var
    kuzzle,
    emitted;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', 'this is not an index');
    emitted = false;
  });

  it('should throw an error if no callback is provided', function () {
    should(function () { kuzzle.getStatistics(); }).throw(Error);
    should(emitted).be.false();
    should(function () { kuzzle.getStatistics(132); }).throw(Error);
    should(emitted).be.false();
    should(function () { kuzzle.getStatistics({}); }).throw(Error);
    should(emitted).be.false();
    should(function () { kuzzle.getStatistics(456, {}); }).throw(Error);
    should(emitted).be.false();
  });


});
