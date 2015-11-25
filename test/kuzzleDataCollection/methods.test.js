var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataCollection = rewire('../../src/kuzzleDataCollection'),
  KuzzleDocument = require('../../src/kuzzleDocument'),
  KuzzleDataMapping = require('../../src/kuzzleDataMapping');

describe('KuzzleDataCollection methods', function () {
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

      if (cb) {
        if (error) {
          return cb(error);
        }

        cb(error, result);
      }
    },
    emitted,
    kuzzle;

  describe('#advancedSearch', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { hits: { total: 123, hits: [ {_id: 'foobar', _source: { foo: 'bar'}} ]}};
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'search',
        controller: 'read',
        body: {}
      };
    });

    it('should send the right search query to kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = {queuable: false},
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);
      expectedQuery.options = options;
      expectedQuery.body = filters;

      should(collection.advancedSearch(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.hits.total);
        should(res.documents).be.an.Array();
        should(res.documents.length).be.exactly(result.hits.hits.length);

        res.documents.forEach(function (item) {
          should(item).be.instanceof(KuzzleDocument);
        });
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.advancedSearch(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.advancedSearch({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.advancedSearch({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.advancedSearch({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.advancedSearch({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.advancedSearch({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#count', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { count: 42 };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'count',
        controller: 'read',
        body: {}
      };
    });

    it('should send the right count query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false },
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };
      expectedQuery.options = options;
      expectedQuery.body = filters;

      should(collection.count(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.a.Number().and.be.exactly(result.count);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.count(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.count({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.count({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.count({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.count({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.count({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#create', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { acknowledged: true };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'createCollection',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right createCollection query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.create(options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object().and.be.exactly(result);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.create(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.create({}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.create(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#createDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { _id: 'foobar', _source: { foo: 'bar' } };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'create',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right createDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.createDocument(result._source, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.createDocument({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.createDocument({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should be able to handle a KuzzleDocument argument', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        document = new KuzzleDocument(collection, result._source);

      should(collection.createDocument(document, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should be able to handle the updateIfExist option', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      expectedQuery.action = 'createOrUpdate';

      collection.createDocument(result._source, {updateIfExist: true});
      should(emitted).be.true();
    });
  });

  describe('#delete', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { acknowledged: true };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'deleteCollection',
        controller: 'admin',
        body: {}
      };
    });

    it('should send the right deleteCollection query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.delete(options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object().and.be.exactly(result);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.delete(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.delete({}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#deleteDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { _id: 'foobar' };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'delete',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.deleteDocument(result._id, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match([result._id]);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.deleteDocument(result._id);
      should(emitted).be.true();

      collection.deleteDocument(result._id, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.deleteDocument(result._id, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.deleteDocument(result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should execute a deleteByQuery if a set of filters is provided', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);
      expectedQuery.body = filters;
      expectedQuery.action = 'deleteByQuery';
      result = { ids: ['foo', 'bar'] };

      collection.deleteDocument(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match(result.ids);
        done();
      });
      should(emitted).be.true();
    });
  });

  describe('#fetchDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { _id: 'foobar', _source: {foo: 'bar'} };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'get',
        controller: 'read',
        body: {}
      };
    });

    it('should send the right fetchDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      should(collection.fetchDocument(result._id, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.fetchDocument(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchDocument({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchDocument({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.fetchDocument({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.fetchDocument({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.fetchDocument({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#fetchAllDocuments', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      emitted = false;
    });

    it('should forward the query to the advancedSearch method', function () {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      collection.advancedSearch = function () { emitted = true; };
      expectedQuery.options = options;

      should(collection.fetchAllDocuments(options, function () {})).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.fetchAllDocuments(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchAllDocuments({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.advancedSearch = function () { emitted = true; };

      collection.fetchAllDocuments(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.fetchAllDocuments({}, function () {});
      should(emitted).be.true();
    });
  });

  describe('#getMapping', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { mainindex: { mappings: { foo: { properties: {}}}} };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'getMapping',
        controller: 'admin',
        body: {}
      };
    });

    it('should send instantiate a new KuzzleDataMapping object', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      should(collection.getMapping(options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDataMapping);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.getMapping(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.getMapping({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.getMapping(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.getMapping({}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.getMapping({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#publish', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { _id: 'foobar', _source: {foo: 'bar'} };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'create',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right publish query to Kuzzle', function () {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      collection.publish(result._source, options);
      should(emitted).be.true();
    });

    it('should handle a KuzzleDocument object as an argument', function () {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      collection.publish(new KuzzleDocument(collection, result._source), options);
      should(emitted).be.true();
    });
  });

  describe('#putMapping', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { _source: { properties: {}}};
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'putMapping',
        controller: 'admin',
        body: {}
      };
    });

    it('should send instantiate a new KuzzleDataMapping object', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      should(collection.putMapping(result, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDataMapping);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.putMapping(result, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.putMapping(result, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.putMapping({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#replaceDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      result = { _id: 'foobar', _source: { foo: 'bar' } };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'createOrUpdate',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right replaceDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.replaceDocument(result._id, result._source, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.replaceDocument('foo');
      should(emitted).be.true();

      emitted = false;
      collection.replaceDocument('foo', {});
      should(emitted).be.true();

      emitted = false;
      collection.replaceDocument('foo', {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.replaceDocument('foo', {}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.replaceDocument(result._id, result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });
});