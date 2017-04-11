var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  Kuzzle = rewire('../../src/Kuzzle'),
  SearchResult = require('../../src/SearchResult'),
  Collection = rewire('../../src/Collection.js'),
  Document = require('../../src/Document'),
  CollectionMapping = require('../../src/CollectionMapping'),
  Room = require('../../src/Room'),
  SubscribeResult = require('../../src/SubscribeResult');

describe('Collection methods', function () {
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
    kuzzle;

  describe('#search', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: { _scroll_id: 'banana', total: 123, hits: [ {_id: 'foobar', _source: { foo: 'bar'}} ], aggregations: {someAggregate: {}}}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'search',
        controller: 'document',
        body: {}
      };
    });

    it('should send the right search query to kuzzle and retrieve the scrollId if exists', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = {queuable: false},
        filters = { scroll: '30s', and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);
      expectedQuery.options = options;
      expectedQuery.body = filters;

      collection.search(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.instanceOf(SearchResult);
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.documents).be.an.Array();
        should(res.documents.length).be.exactly(result.result.hits.length);
        should(res.options.scrollId).be.exactly('banana');
        should(res.aggregations).be.deepEqual(result.result.aggregations);

        res.documents.forEach(function (item) {
          should(item).be.instanceof(Document);
        });
        done();
      });
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      should(function () { collection.search(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.search({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.search({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      collection.search({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.search({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.collection(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.search({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#scroll', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: { _scroll_id: 'banana', total: 123, hits: [ {_id: 'foobar', _source: { foo: 'bar'}} ], aggregations: {someAggregate: {}}}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'scroll',
        controller: 'document',
        body: {}
      };
    });

    it('should throw an error if no scrollId is set', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      should(function () { collection.scroll(); }).throw('Collection.scroll: scrollId is required');
    });

    it('should throw an error if no callback is given', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      should(function () { collection.scroll('scrollId'); }).throw('Collection.scroll: a callback argument is required for read queries');
    });

    it('should parse the given parameters', function (done) {
      var
        queryScrollStub,
        collection = kuzzle.collection(expectedQuery.collection),
        scrollId = 'scrollId',
        filters = {},
        options = {},
        cb = function () {
          done();
        };

      queryScrollStub = function (args, query, opts, callback) {
        should(args.controller).be.exactly('document');
        should(args.action).be.exactly('scroll');
        should(query.scroll).be.exactly(options.scroll);
        should(query.scrollId).be.exactly(scrollId);

        callback(null, {
          result: {
            total: 1,
            _scroll_id: 'banana',
            hits: [
              {
                _id: 'foo',
                _source: {bar: 'baz'}
              }
            ]
          }
        });
      };

      kuzzle.query = queryScrollStub;

      collection.scroll(scrollId, options, filters, cb);
    });
  });

  describe('#count', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {count: 42 }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'count',
        controller: 'document',
        body: {}
      };
    });

    it('should send the right count query to Kuzzle', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false },
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };
      expectedQuery.options = options;
      expectedQuery.body = filters;

      collection.count(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.a.Number().and.be.exactly(result.result.count);
        done();
      });
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      should(function () { collection.count(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.count({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.count({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      collection.count({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.count({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.collection(expectedQuery.collection);
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
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {acknowledged: true }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'create',
        controller: 'collection'
      };
    });

    it('should send the right createCollection query to Kuzzle', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
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
      var collection = kuzzle.collection(expectedQuery.collection);

      collection.create(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.create({}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.collection(expectedQuery.collection);
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
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_id: 'foobar', _source: { foo: 'bar' }, _version: 1} };
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'create',
        controller: 'document',
        body: {}
      };
    });

    it('should send the right createDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.createDocument(result.result._source, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      collection.createDocument('id', {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument('id', {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument('id', {}, {}, function () {});
      should(emitted).be.true();

      collection.createDocument(null, {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument(null, {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument(null, {}, {}, function () {});
      should(emitted).be.true();

      collection.createDocument(undefined, {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument(undefined, {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument(undefined, {}, {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should handle a document ID if one is provided', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      expectedQuery._id = 'foo';

      collection.createDocument('foo', {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.collection(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.createDocument({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should be able to handle a Document argument', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        document = new Document(collection, result.result._source);

      should(collection.createDocument(document, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should be able to handle the ifExist=replace option', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      expectedQuery.action = 'createOrReplace';

      collection.createDocument(result.result._source, {ifExist: 'replace'});
      should(emitted).be.true();
    });

    it('should be able to handle the ifExist=error option', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      expectedQuery.action = 'create';

      collection.createDocument(result.result._source, {ifExist: 'error'});
      should(emitted).be.true();
    });

    it('should throw an error if the ifExist option is invalid', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      should(function () {
        collection.createDocument(result.result._source, {ifExist: 'foobar'});
      }).throw();
    });
  });

  describe('#deleteDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_id: 'foobar' } };
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'delete',
        controller: 'document',
        body: {}
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.deleteDocument(result.result._id, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match([result.result._id]);
        done();
      }));
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      collection.deleteDocument(result.result._id);
      should(emitted).be.true();

      collection.deleteDocument(result.result._id, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.deleteDocument(result.result._id, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.collection(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.deleteDocument(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should execute a deleteByQuery if a set of filters is provided', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);
      expectedQuery.body = {query: filters};
      expectedQuery.action = 'deleteByQuery';
      result = { result: {ids: ['foo', 'bar'] }};

      collection.deleteDocument(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match(result.result.ids);
        done();
      });
      should(emitted).be.true();
    });
  });

  describe('#fetchDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_id: 'foobar', _source: {foo: 'bar'} }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'get',
        controller: 'document',
        body: {}
      };
    });

    it('should send the right fetchDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      collection.fetchDocument(result.result._id, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        done();
      });
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      should(function () { collection.fetchDocument(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchDocument({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchDocument({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      collection.fetchDocument({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.fetchDocument({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.collection(expectedQuery.collection);
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
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      emitted = false;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'get',
        controller: 'document',
        body: {}
      };
    });

    it('should forward the query to the search method', function () {
      var
        collection = kuzzle.collection('collection'),
        options = { queuable: false };

      collection.search = function () { emitted = true; };

      collection.fetchAllDocuments(options, function () {});
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.collection('collection');
      should(function () { collection.fetchAllDocuments(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchAllDocuments({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var
        collection = kuzzle.collection('collection'),
        mockSearchResult = new SearchResult(
          collection,
          1,
          [new Document(collection, 'banana', {answer: 42})],
          {},
          {options: {}, filters: {from: 0, size: 1000}}
        );

      collection.search = function (filters, options, cb) {
        cb(null, mockSearchResult);
      };

      collection.fetchAllDocuments(function () {emitted = true;});
      should(emitted).be.true();

      emitted = false;
      collection.fetchAllDocuments({}, function () {emitted = true;});
      should(emitted).be.true();
    });

    it('should handle the from and size options', function () {
      var
        collection = kuzzle.collection('collection'),
        stub = sinon.stub(collection, 'search');

      collection.fetchAllDocuments({from: 123, size: 456}, function () {});
      should(stub.calledOnce).be.true();
      should(stub.calledWithMatch({}, {from: 123, size: 456})).be.true();
      stub.restore();
    });

    it('should handle the scroll options', function () {
      var
        collection = kuzzle.collection('collection'),
        stub = sinon.stub(collection, 'search');

      collection.fetchAllDocuments({scroll: '30s'}, function () {});
      should(stub.calledOnce).be.true();
      should(stub.calledWithMatch({}, {from: 0, size: 1000, scroll: '30s'})).be.true();
      stub.restore();
    });

    it('should transfer error if any', function (done) {
      var
        collection = kuzzle.collection('collection');

      collection.search = function (filters, options, cb) {
        cb(new Error('foobar'));
      };

      collection.fetchAllDocuments(function (er) {
        should(er).be.an.instanceOf(Error);
        should(er.message).be.exactly('foobar');
        done();
      });
    });
  });

  describe('#getMapping', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {'bar': { mappings: { foo: { properties: {}}}} }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'getMapping',
        controller: 'collection',
        body: {}
      };
    });

    it('should instantiate a new CollectionMapping object', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      collection.getMapping(options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(CollectionMapping);
        done();
      });
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      should(function () { collection.getMapping(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.getMapping({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      collection.getMapping(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.getMapping({}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.collection(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.getMapping({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#publishMessage', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_source: {foo: 'bar'} }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'publish',
        controller: 'realtime',
        body: {}
      };
    });

    it('should send the right publish query to Kuzzle', function () {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      collection.publishMessage(result.result._source, options);
      should(emitted).be.true();
    });

    it('should handle a Document object as an argument', function () {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      collection.publishMessage(new Document(collection, result.result._source), options);
      should(emitted).be.true();
    });
  });

  describe('#replaceDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_id: 'foobar', _source: { foo: 'bar' } }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'createOrReplace',
        controller: 'document',
        body: {}
      };
    });

    it('should send the right replaceDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.replaceDocument(result.result._id, result.result._source, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

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
      var collection = kuzzle.collection(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.replaceDocument(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#subscribe', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.state = 'connected';
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {roomId: 'foobar' }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'subscribe',
        controller: 'realtime',
        body: {}
      };
    });

    it('should instantiate a new Room object', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      should(collection.subscribe(expectedQuery.body, {}, function () {})).be.instanceof(SubscribeResult);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      should(collection.subscribe(expectedQuery.body, function () {})).be.instanceof(SubscribeResult);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.collection(expectedQuery.collection);
      should(function () { collection.subscribe({}); }).throw(Error);
      should(emitted).be.false();
    });
  });

  describe('#truncate', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {acknowledged: true }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'truncate',
        controller: 'collection',
        body: {}
      };
    });

    it('should send the right truncate query to Kuzzle', function () {
      var
        collection = kuzzle.collection(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      should(collection.truncate(options, function () {})).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.collection(expectedQuery.collection);

      collection.truncate();
      should(emitted).be.true();

      emitted = false;
      collection.truncate({});
      should(emitted).be.true();

      emitted = false;
      collection.truncate({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.truncate(function () {});
      should(emitted).be.true();
    });
  });

  describe('#updateDocument', function () {
    var
      revert,
      refreshed = false;

    beforeEach(function () {
      revert = Collection.__set__('Document', function (collection) {
        var doc = new Document(collection, 'foo', {});

        doc.refresh = function (cb) {
          refreshed = true;
          cb(null, doc);
        };

        return doc;
      });

      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;

      emitted = false;
      result = { result: {_id: 'foobar', _source: { foo: 'bar' } }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'update',
        controller: 'document',
        body: {}
      };
    });

    afterEach(function () {
      revert();
    });

    it('should send the right updateDocument query to Kuzzle', function (done) {
      var
        collection = new Collection(kuzzle, expectedQuery.collection, expectedQuery.index),
        options = { queuable: false, retryOnConflict: 42 };
      expectedQuery.options = options;
      expectedQuery.retryOnConflict = 42;

      should(collection.updateDocument(result.result._id, result.result._source, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        should(refreshed).be.true();
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = new Collection(kuzzle, expectedQuery.collection, expectedQuery.index);

      collection.updateDocument('foo');
      should(emitted).be.true();

      emitted = false;
      collection.updateDocument('foo', {});
      should(emitted).be.true();

      emitted = false;
      collection.updateDocument('foo', {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.updateDocument('foo', {}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = new Collection(kuzzle, expectedQuery.collection, expectedQuery.index);
      error = 'foobar';
      this.timeout(50);

      collection.updateDocument(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#factories', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    });

    it('document should return a new Document object', function () {
      should(kuzzle.collection('foo').document('foo', { foo: 'bar'})).be.instanceof(Document);
    });

    it('room should return a new Room object', function () {
      should(kuzzle.collection('foo').room()).be.instanceof(Room);
    });

    it('collectionMapping should return a CollectionMapping object', function () {
      should(kuzzle.collection('foo').collectionMapping({})).be.instanceof(CollectionMapping);
    });
  });
});
