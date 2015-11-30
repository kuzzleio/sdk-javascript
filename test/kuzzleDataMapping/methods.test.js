var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataMapping = rewire('../../src/kuzzleDataMapping');

describe('KuzzleDataMapping methods', function () {
  var
    expectedQuery,
    error,
    result,
    queryStub = function (collection, controller, action, query, options, cb) {
      emitted = true;
      should(collection).be.exactly(expectedQuery.collection);
      should(controller).be.exactly(expectedQuery.controller);
      should(action).be.exactly(expectedQuery.action);

      if (expectedQuery.options) {
        should(options).match(expectedQuery.options);
      }

      if (expectedQuery.body) {
        should(query.body).match(expectedQuery.body);
      } else {
        should(Object.keys(query).length).be.exactly(0);
      }

      if (expectedQuery._id) {
        should(query._id).be.exactly(expectedQuery._id);
      }

      if (cb) {
        if (error) {
          return cb(error);
        }

        cb(error, result);
      }
    },
    emitted,
    kuzzle,
    dataCollection;

  describe('#apply', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { _source: { properties: { foo: {type: 'date'}}}};
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'putMapping',
        controller: 'admin',
        body: result._source
      };
    });

    it('should call the right putMapping query when invoked', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection, result._source.properties);

      this.timeout(50);
      expectedQuery.options = { queuable: false};

      should(mapping.apply(expectedQuery.options, function (err, res) {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(mapping);
        done();
      })).be.exactly(mapping);
    });

    it('should handle arguments correctly', function () {
      var mapping = new KuzzleDataMapping(dataCollection, result._source.properties);

      mapping.apply();
      should(emitted).be.true();

      emitted = false;
      mapping.apply({});
      should(emitted).be.true();

      emitted = false;
      mapping.apply(function () {});
      should(emitted).be.true();

      emitted = false;
      mapping.apply({}, function () {});
      should(emitted).be.true();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection, result._source.properties);

      this.timeout(50);
      error = 'foobar';

      mapping.apply();
      should(emitted).be.true();

      emitted = false;
      mapping.apply((err, res) => {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#refresh', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { mainindex: { mappings: { foo: { properties: { foo: {type: 'date'}}}}}};
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'getMapping',
        controller: 'admin',
        body: {}
      };
    });

    it('should call the right getMapping query when invoked', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection);

      this.timeout(50);
      expectedQuery.options = { queuable: false};

      should(mapping.refresh(expectedQuery.options, function (err, res) {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(mapping);
        should(res.mapping).match(result.mainindex.mappings.foo.properties);
        done();
      })).be.exactly(mapping);
    });

    it('should handle arguments correctly', function () {
      var mapping = new KuzzleDataMapping(dataCollection);

      mapping.refresh(function () {});
      should(emitted).be.true();

      emitted = false;
      mapping.refresh({}, function () {});
      should(emitted).be.true();

      emitted = false;
      mapping.refresh(function () {});
      should(emitted).be.true();

      emitted = false;
      mapping.refresh({});
      should(emitted).be.true();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection);

      this.timeout(50);
      error = 'foobar';

      mapping.refresh();
      should(emitted).be.true();

      emitted = false;
      mapping.refresh((err, res) => {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#set', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should allow setting a field mapping', function () {
      var mapping = new KuzzleDataMapping(dataCollection);

      should(mapping.set('foo', { type: 'date'})).be.exactly(mapping);
      should(mapping.mapping.foo).match({type: 'date'});

      mapping.set('bar', {type: 'string'});
      should(mapping.mapping.bar).match({type: 'string'});

      mapping.set('foo', {type: 'string'});
      should(mapping.mapping.bar).match({type: 'string'});
    });
  });

  describe('#setHeaders', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should allow setting headers', function () {
      var
        mapping = new KuzzleDataMapping(dataCollection),
        header = {_id: 'foobar'};

      should(mapping.setHeaders(header)).be.exactly(mapping);
      should(mapping.headers).match(header);

      expectedQuery._id = 'foobar';
      mapping.apply();
      should(emitted).be.true();
    });
  });
});