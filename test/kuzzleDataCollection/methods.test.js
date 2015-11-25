var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataCollection = rewire('../../src/kuzzleDataCollection');

describe('KuzzleDataCollection methods', function () {
  var
    expectedQuery,
    passedOptions,
    error,
    result,
    collection,
    queryStub = function (c, controller, action, query, options, cb) {
      emitted = true;
      should(c).be.exactly(collection);
      should(controller).be.exactly(expectedQuery.controller);
      should(action).be.exactly(expectedQuery.action);

      if (passedOptions) {
        should(options).match(passedOptions);
      }

      if (expectedQuery.body) {
        should(query.body).match(expectedQuery.body);
      } else {
        should(Object.keys(query).length).be.exactly(0);
      }

      cb(error, result);
    },
    emitted,
    kuzzle;

  describe('#advancedSearch', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      expectedQuery = {
        action: 'search',
        controller: 'read'
      };
    });

    //it('')
  });
});