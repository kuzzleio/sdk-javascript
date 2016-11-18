var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataValidation = rewire('../../src/kuzzleDataValidation');

describe('KuzzleDataValidation methods', function () {
  var
    expectedQuery,
    error,
    result,
    queryStub = function (args, query, options, cb) {
      emitted = true;
      should(args.index).be.exactly(expectedQuery.index);
      should(args.collection).be.exactly(expectedQuery.collection);
      should(args.controller).be.exactly(expectedQuery.controller);
      should(args.action).be.exactly(expectedQuery.action);

      if (expectedQuery.options) {
        should(options).match(expectedQuery.options);
      }

      if (expectedQuery.body) {
        if (!query.body) {
          query.body = {};
        }

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
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { result: {_source: { bar: { foo: {type: 'date'}}}}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'updateSpecifications',
        controller: 'admin',
        body: result.result._source
      };
    });

    it('should call the right updateSpecifications query when invoked', function (done) {
      var
        refreshed = false,
        specifications = new KuzzleDataValidation(dataCollection, result.result._source.bar.foo);

      this.timeout(50);
      expectedQuery.options = { queuable: false};
      specifications.refresh = function (options, cb) {
        refreshed = true;
        cb(null, specifications);
      };

      should(specifications.apply(expectedQuery.options, function (err, res) {
        should(emitted).be.true();
        should(refreshed).be.true();
        should(err).be.null();
        should(res).be.exactly(specifications);
        done();
      })).be.exactly(specifications);
    });

    it('should handle arguments correctly', function () {
      var
        refreshed = false,
        specifications = new KuzzleDataValidation(dataCollection, result.result._source.bar.foo);

      specifications.refresh = function (options, cb) {
        refreshed = true;

        if (cb) {
          cb(null, specifications);
        }
      };

      specifications.apply();
      should(emitted).be.true();
      should(refreshed).be.true();

      emitted = false;
      refreshed = false;
      specifications.apply({});
      should(emitted).be.true();
      should(refreshed).be.true();

      emitted = false;
      refreshed = false;
      specifications.apply(function () {});
      should(emitted).be.true();
      should(refreshed).be.true();

      emitted = false;
      refreshed = false;
      specifications.apply({}, function () {});
      should(emitted).be.true();
      should(refreshed).be.true();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      var specifications = new KuzzleDataValidation(dataCollection, result.result._source.bar.foo);

      this.timeout(50);
      error = 'foobar';

      specifications.apply();
      should(emitted).be.true();

      emitted = false;
      specifications.apply((err, res) => {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#refresh', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { result: {bar: { foo: {type: 'date'}}}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'getSpecifications',
        controller: 'admin',
        body: {}
      };
    });

    it('should call the right getSpecifications query when invoked', function (done) {
      var specifications = new KuzzleDataValidation(dataCollection);

      this.timeout(50);
      expectedQuery.options = { queuable: false};

      should(specifications.refresh(expectedQuery.options, function (err, res) {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(specifications);
        should(res.specifications).match(result.result[dataCollection.index].foo.bar);
        done();
      })).be.exactly(specifications);
    });

    it('should handle arguments correctly', function () {
      var specifications = new KuzzleDataValidation(dataCollection);

      specifications.refresh(function () {});
      should(emitted).be.true();

      emitted = false;
      specifications.refresh({}, function () {});
      should(emitted).be.true();

      emitted = false;
      specifications.refresh(function () {});
      should(emitted).be.true();

      emitted = false;
      specifications.refresh({});
      should(emitted).be.true();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      var specifications = new KuzzleDataValidation(dataCollection);

      this.timeout(50);
      error = 'foobar';

      specifications.refresh();
      should(emitted).be.true();

      emitted = false;
      specifications.refresh((err, res) => {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should return an empty specification if the stored specification is empty', done => {
      var specifications = new KuzzleDataValidation(dataCollection);

      result = { result: null};

      specifications.refresh((err, res) => {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(specifications);
        should(res.specifications).be.empty().and.not.be.undefined();
        done();
      });
    });
  });

  describe('#delete', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = {};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'deleteSpecifications',
        controller: 'admin',
        body: {}
      };
    });

    it('should call the right deleteSpecifications query when invoked', function (done) {
      var specifications = new KuzzleDataValidation(dataCollection);

      this.timeout(50);
      expectedQuery.options = { queuable: false};

      should(specifications.delete(expectedQuery.options, function (err, res) {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(specifications);
        should(res.specifications).be.empty().and.not.be.undefined();
        done();
      })).be.exactly(specifications);
    });

    it('should handle arguments correctly', function () {
      var specifications = new KuzzleDataValidation(dataCollection);

      specifications.delete(function () {});
      should(emitted).be.true();

      emitted = false;
      specifications.delete({}, function () {});
      should(emitted).be.true();

      emitted = false;
      specifications.delete(function () {});
      should(emitted).be.true();

      emitted = false;
      specifications.delete({});
      should(emitted).be.true();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      var specifications = new KuzzleDataValidation(dataCollection);

      this.timeout(50);
      error = 'foobar';

      specifications.delete();
      should(emitted).be.true();

      emitted = false;
      specifications.delete((err, res) => {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should return an empty specification if the stored specification is empty', done => {
      var specifications = new KuzzleDataValidation(dataCollection);

      result = { result: null};

      specifications.delete((err, res) => {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(specifications);
        should(res.specifications).be.empty().and.not.be.undefined();
        done();
      });
    });
  });

  describe('#setHeaders', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should allow setting headers', function () {
      var
        specifications = new KuzzleDataValidation(dataCollection),
        header = {_id: 'foobar'};

      should(specifications.setHeaders(header)).be.exactly(specifications);
      should(specifications.headers).match(header);

      expectedQuery._id = 'foobar';
      specifications.apply();
      should(emitted).be.true();
    });
  });
});