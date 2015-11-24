var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataCollection = require('../../src/kuzzleDataCollection');

describe('Kuzzle methods', function () {
  var
    expectedQuery,
    passedOptions,
    error,
    result,
    queryStub = function (collection, controller, action, query, options, cb) {
      emitted = true;
      should(collection).be.null();
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

  describe('#getAllStatistics', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {statistics: {}};
      expectedQuery = {
        controller: 'admin',
        action: 'getAllStats'
      };
    });

    it('should return the kuzzle instance when called', function () {
      should(kuzzle.getAllStatistics(function () {})).be.exactly(kuzzle);
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getAllStatistics(); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.getAllStatistics({some: 'options'}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should call the query function with the right arguments', function () {
      kuzzle.getAllStatistics(function () {});
      should(emitted).be.true();

      emitted = false;
      passedOptions = {queuable: true, metadata: {foo: 'bar'}};
      kuzzle.getAllStatistics(passedOptions, function () {});
    });

    it('should reformat the statistics frame according to the documentation', function (done) {
      this.timeout(50);

      result = {
        statistics: {
          123: { some: 'stats' },
          456: { someother: 'stats'}
        }
      };

      kuzzle.getAllStatistics(function (err, res) {
        should(err).be.null();
        should(res).be.an.Array();
        should(res.length).be.exactly(2);
        should(res[0]).be.an.Object();
        should(Object.keys(res[0]).length).be.exactly(2);
        should(res[0].timestamp).be.exactly('123');
        should(res[0].some).be.exactly('stats');
        should(res[1]).be.an.Object();
        should(Object.keys(res[1]).length).be.exactly(2);
        should(res[1].timestamp).be.exactly('456');
        should(res[1].someother).be.exactly('stats');
        done();
      });
    });

    it('should execute the callback with an error if an error occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.getAllStatistics(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#getStatistics', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {statistics: {}};
      expectedQuery = {
        controller: 'admin',
        action: 'getLastStats'
      };
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getStatistics(); }).throw(Error);
      should(function () { kuzzle.getStatistics(123456); }).throw(Error);
      should(function () { kuzzle.getStatistics({}); }).throw(Error);
      should(function () { kuzzle.getStatistics(123456, {}); }).throw(Error);
    });

    it('should return the last statistics frame if no timestamp is provided', function () {
      should(kuzzle.getStatistics(function () {})).be.exactly(kuzzle);
      should(emitted).be.true();
    });

    it('should return statistics frames starting from the given timestamp', function () {
      expectedQuery = {
        controller: 'admin',
        action: 'getStats',
        body: { startTime: 123 }
      };

      result = {
        statistics: {
          123: {},
          456: {},
          789: {}
        }
      };

      kuzzle.getStatistics(123, function () {});
      should(emitted).be.true();
    });

    it('should execute the provided callback with an error argument if one occurs', function (done) {
      error = 'foobar';
      kuzzle.getStatistics(function (err, res) {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should handle arguments properly', function () {
      /*
      already tested by previous tests:
       getStatistics(callback)
       getStatistics(timestamp, callback)
       */

      // testing: getStatistics(options, callback)
      passedOptions = { foo: 'bar' };
      kuzzle.getStatistics(passedOptions, function () {});
      should(emitted).be.true();

      // testing: getStatistics(timestamp, options callback);
      emitted = false;
      expectedQuery = {
        controller: 'admin',
        action: 'getStats',
        body: { startTime: 123 }
      };
      kuzzle.getStatistics(123, passedOptions, function () {});
      should(emitted).be.true();
    });
  });

  describe('#dataCollectionFactory', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if the kuzzle instance has been invalidated', function () {
      kuzzle.socket = null;
      should(function () { kuzzle.dataCollectionFactory('foo'); }).throw(Error);
    });

    it('should create and store the data collection instance if needed', function () {
      var collection = kuzzle.dataCollectionFactory('foo');

      should(kuzzle.collections['foo']).not.be.undefined().and.be.instanceof(KuzzleDataCollection);
      should(collection).be.instanceof(KuzzleDataCollection);
    });

    it('should simply pull the collection from the collection history if reinvoked', function () {
      kuzzle.collections['foo'] = 'bar';
      should(kuzzle.dataCollectionFactory('foo')).be.a.String().and.be.exactly('bar');
    });
  });

  describe('#listCollections', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {collections: []};
      expectedQuery = {
        controller: 'read',
        action: 'listCollections'
      };
    });

    it('should return the kuzzle instance when called', function () {
      should(kuzzle.listCollections(function () {})).be.exactly(kuzzle);
    });

    it('should throw an error if no callback has been provided', function () {
      should(function () { kuzzle.listCollections(); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.listCollections({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should call query with the right arguments', function (done) {
      this.timeout(50);
      result = { collections: ['foo', 'bar', 'baz', 'qux'] };

      kuzzle.listCollections(function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match(result.collections);
        done();
      });
    });

    it('should execute the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.listCollections(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#logout', function () {
    it('should clean up and invalidate the instance if called', function () {
      var kuzzle = new Kuzzle('foo');

      kuzzle.collections = { foo: {}, bar: {}, baz: {} };
      kuzzle.logout();

      should(kuzzle.socket).be.null();
      should(kuzzle.collections).be.empty();
      should(function () { kuzzle.isValid(); }).throw(Error);
    });
  });

  describe('#now', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {now: Date.now()};
      expectedQuery = {
        controller: 'read',
        action: 'now'
      };
    });

    it('should return the kuzzle instance when called', function () {
      should(kuzzle.now(function () {})).be.exactly(kuzzle);
    });

    it('should throw an error if called without a callback', function () {
      should(function () { kuzzle.now(); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.now({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should call query with the right arguments', function (done) {
      this.timeout(50);

      kuzzle.now(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.now);
        done();
      });
    });

    it('should execute the callback with an error argument if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.now(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#setHeaders', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if an invalid content object is provided', function () {
      should(function () { kuzzle.setHeaders(); }).throw(Error);
      should(function () { kuzzle.setHeaders(123); }).throw(Error);
      should(function () { kuzzle.setHeaders('foo'); }).throw(Error);
      should(function () { kuzzle.setHeaders(['mama', 'mia']); }).throw(Error);
    });

    it('should set headers properly', function () {
      should(kuzzle.setHeaders({foo: 'bar'})).be.exactly(kuzzle);
      kuzzle.setHeaders({bar: 'baz', baz: ['bar, baz, qux', 'foo']});
      kuzzle.setHeaders({foo: { bar: 'baz'}});

      should(kuzzle.headers).match({bar: 'baz', baz: ['bar, baz, qux', 'foo'], foo: { bar: 'baz'}});
    });

    it('should replace existing headers if asked to', function () {
      kuzzle.setHeaders({foo: 'bar'});
      kuzzle.setHeaders({}, true);

      should(kuzzle.headers).be.empty();
    });
  });
});
