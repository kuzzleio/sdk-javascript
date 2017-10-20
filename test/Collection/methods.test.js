var
  should = require('should'),
  rewire = require('rewire'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  SearchResult = require('../../src/SearchResult'),
  Collection = rewire('../../src/Collection.js'),
  Document = require('../../src/Document'),
  CollectionMapping = require('../../src/CollectionMapping'),
  Room = require('../../src/Room'),
  SubscribeResult = require('../../src/SubscribeResult'),
  Bluebird = require('bluebird');

describe('Collection methods', function () {
  var
    expectedQuery,
    result,
    collection,
    kuzzle;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.bluebird = Bluebird;
    kuzzle.query = sinon.stub();
    collection = new Collection(kuzzle, 'foo', 'bar');
  });

  describe('#search', function () {
    beforeEach(function () {
      result = {
        result: {
          _scroll_id: 'banana',
          total: 123,
          hits: [
            {_id: 'foobar', _source: { foo: 'bar'}, _meta: {author: 'toto'}}
          ],
          aggregations: {someAggregate: {}}
        }
      };
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'search',
        controller: 'document'
      };
    });

    it('should send the right search query to kuzzle and retrieve the scrollId if exists', function (done) {
      var
        options = {queuable: false},
        filters = { scroll: '30s', and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);

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

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: filters}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.search(); }).throw(Error);
      should(function () { collection.search({}); }).throw(Error);
      should(function () { collection.search({}, {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.search({}, cb1);
      collection.search({}, {}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.search({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#scroll', function () {
    beforeEach(function () {
      result = { result: { _scroll_id: 'banana', total: 123, hits: [ {_id: 'foobar', _source: { foo: 'bar'}} ]}};
      expectedQuery = {
        action: 'scroll',
        controller: 'document'
      };
    });

    it('should throw an error if no scrollId is set', function () {
      should(function () { collection.scroll(); }).throw('Collection.scroll: scrollId is required');
    });

    it('should throw an error if no callback is given', function () {
      should(function () { collection.scroll('scrollId'); }).throw('Collection.scroll: a callback argument is required for read queries');
    });

    it('should parse the given parameters', function (done) {
      var
        scrollId = 'scrollId',
        filters = {},
        options = {};

      this.timeout(50);

      collection.scroll(scrollId, options, filters, function(err, res) {
        should(err).be.null();
        should(res).be.an.instanceOf(SearchResult);
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.documents).be.an.Array();
        should(res.documents.length).be.exactly(result.result.hits.length);
        should(res.options.scrollId).be.exactly('banana');
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {scrollId: 'scrollId'}, {}, sinon.match.func);

      kuzzle.query.yield(null, result);

    });
  });

  describe('#scrollSpecifications', function () {
    beforeEach(function () {
      result = { result: { scrollId: '1337', total: 2, hits: [
        { _id: 'foo#bar', _source: { foo: 'bar' } },
        { _id: 'bar#foo', _source: { bar: 'foo' } }
      ] } };
      expectedQuery = {
        action: 'scrollSpecifications',
        controller: 'collection'
      };
    });

    it('should throw an error if no scrollId is set', function () {
      should(function () { collection.scrollSpecifications(); }).throw('Collection.scrollSpecifications: scrollId is required');
    });

    it('should throw an error if no callback is given', function () {
      should(function () { collection.scrollSpecifications('1337'); }).throw('Collection.scrollSpecifications: a callback argument is required for read queries');
    });

    it('should parse the given parameters', function (done) {
      var
        scrollId = 'scrollId',
        options = {};

      this.timeout(50);

      collection.scrollSpecifications(scrollId, options, function(err, res) {
        should(err).be.null();
        should(res).be.an.instanceOf(Object).and.match(result.result);
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.hits).be.an.Array();
        should(res.hits.length).be.exactly(result.result.hits.length);
        should(res.scrollId).be.exactly('1337');

        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, { scrollId: 'scrollId' }, {}, sinon.match.func);

      kuzzle.query.yield(null, result);
    });
  });

  describe('#count', function () {
    beforeEach(function () {
      result = { result: {count: 42 }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'count',
        controller: 'document'
      };
    });

    it('should send the right count query to Kuzzle', function (done) {
      var
        options = { queuable: false },
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);

      collection.count(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.a.Number().and.be.exactly(result.result.count);
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: filters}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.count(); }).throw(Error);
      should(function () { collection.count({}); }).throw(Error);
      should(function () { collection.count({}, {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.count({}, cb1);
      collection.count({}, {}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.count({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#create', function () {
    beforeEach(function () {
      result = { result: {acknowledged: true }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'create',
        controller: 'collection'
      };
    });

    it('should send the right createCollection query to Kuzzle', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      should(collection.create(options, function (err, coll) {
        should(err).be.null();
        should(coll).be.an.Object().and.be.exactly(collection);
        done();
      })).be.exactly(collection);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.create(cb1);
      collection.create({}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.create(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#createDocument', function () {
    var content = {foo: 'bar'};

    beforeEach(function () {
      result = { result: {_id: 'foobar', _source: content, _version: 1} };
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'create',
        controller: 'document'
      };
    });

    it('should send the right createDocument query to Kuzzle', function (done) {
      var
        options = { queuable: false };

      this.timeout(50);

      should(collection.createDocument(content, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        done();
      })).be.exactly(collection);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: content}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub(),
        cb3 = sinon.stub(),
        cb4 = sinon.stub(),
        cb5 = sinon.stub(),
        cb6 = sinon.stub(),
        cb7 = sinon.stub(),
        cb8 = sinon.stub();

      collection.createDocument('id', {}, cb1);
      collection.createDocument('id', {}, {}, cb2);
      collection.createDocument(null, {}, cb3);
      collection.createDocument(null, {}, {}, cb4);
      collection.createDocument(undefined, {}, cb5);
      collection.createDocument(undefined, {}, {}, cb6);
      collection.createDocument({}, cb7);
      collection.createDocument({}, {}, cb8);

      should(kuzzle.query.callCount).be.exactly(8);

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
      should(cb3).be.calledOnce();
      should(cb4).be.calledOnce();
      should(cb5).be.calledOnce();
      should(cb6).be.calledOnce();
      should(cb7).be.calledOnce();
      should(cb8).be.calledOnce();

      kuzzle.query.reset();
      collection.createDocument('id', {});
      collection.createDocument(null, {});
      collection.createDocument(undefined, {});
      should(kuzzle.query.callCount).be.exactly(3);

    });

    it('should handle a document ID if one is provided', function () {
      collection.createDocument('foo', content);
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foo', body: content});
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.createDocument({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });

    it('should be able to handle a Document argument', function (done) {
      var document = new Document(collection, content);

      this.timeout(50);

      should(collection.createDocument(document, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        done();
      })).be.exactly(collection);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: content, meta: {}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should be able to handle the ifExist=replace option', function () {
      expectedQuery.action = 'createOrReplace';

      collection.createDocument(content, {ifExist: 'replace'});
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: content}, {ifExist: 'replace'});
    });

    it('should be able to handle the ifExist=error option', function () {
      collection.createDocument(content, {ifExist: 'error'});
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: content}, {ifExist: 'error'});
    });

    it('should throw an error if the ifExist option is invalid', function () {
      should(function () {
        collection.createDocument(content, {ifExist: 'foobar'});
      }).throw();
    });
  });

  describe('#deleteDocument', function () {
    beforeEach(function () {
      result = { result: {_id: 'foobar' } };
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'delete',
        controller: 'document'
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      should(collection.deleteDocument(result.result._id, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match([result.result._id]);
        done();
      }));

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar'}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should handle arguments correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.deleteDocument(result.result._id, cb1);
      collection.deleteDocument(result.result._id, {}, cb2);

      should(kuzzle.query).be.calledTwice();
      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      collection.deleteDocument(result.result._id);
      should(kuzzle.query).be.calledOnce();
    });


    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.deleteDocument(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });

    it('should execute a deleteByQuery if a set of filters is provided', function (done) {
      var
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);

      expectedQuery.action = 'deleteByQuery';
      result = { result: {ids: ['foo', 'bar'] }};

      collection.deleteDocument(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match(result.result.ids);
        done();
      });
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: {query: filters}}, null, sinon.match.func);

      kuzzle.query.yield(null, result);
    });
  });

  describe('#deleteSpecifications', function () {
    beforeEach(function () {
      result = { result: { acknowledged: true } };
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'deleteSpecifications',
        controller: 'collection'
      };
    });

    it('should send the right deleteSpecifications query to Kuzzle', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      should(collection.deleteSpecifications(options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object().and.match({ acknowledged: true });
        done();
      })).be.exactly(collection);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, { index: expectedQuery.index, collection: expectedQuery.collection }, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should handle arguments correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.deleteSpecifications(cb1);
      collection.deleteSpecifications({}, cb2);

      should(kuzzle.query).be.calledTwice();
      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      collection.deleteSpecifications(result.result._id);
      should(kuzzle.query).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.deleteSpecifications(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.deleteSpecifications(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#documentExists', function () {
    beforeEach(function () {
      result = { result: true };
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'exists',
        controller: 'document'
      };
    });

    it('should send the right documentExists query to Kuzzle', function(done) {
      var options = { queuable: false };

      this.timeout(50);

      collection.documentExists('foo', options, function (err, res) {
        should(err).be.null();
        should(res).be.true();
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foo'}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.documentExists(); }).throw(Error);
      should(function () { collection.documentExists({}); }).throw(Error);
      should(function () { collection.documentExists({}, {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.documentExists({}, cb1);
      collection.documentExists({}, {}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.documentExists({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#fetchDocument', function () {
    beforeEach(function () {
      result = { result: {_id: 'foobar', _source: {foo: 'bar'} }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'get',
        controller: 'document'
      };
    });

    it('should send the right fetchDocument query to Kuzzle', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      collection.fetchDocument('foobar', options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        done();
      });
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar'}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.fetchDocument(); }).throw(Error);
      should(function () { collection.fetchDocument({}); }).throw(Error);
      should(function () { collection.fetchDocument({}, {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.fetchDocument({}, cb1);
      collection.fetchDocument({}, {}, cb2);

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.fetchDocument({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#getMapping', function () {
    beforeEach(function () {
      result = { result: {'bar': { mappings: { foo: { properties: {}}}} }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'getMapping',
        controller: 'collection'
      };
    });

    it('should instantiate a new CollectionMapping object', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      collection.getMapping(options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(CollectionMapping);
        done();
      });
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.getMapping(); }).throw(Error);
      should(function () { collection.getMapping({}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.getMapping(cb1);
      collection.getMapping({}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.getMapping({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#mCreateDocument', function () {
    var content = { documents: [
        { _id: 'foo1', foo: 'bar' },
        { _id: 'foo2', foo: 'bar' }
      ]},
      options = { queuable: false };

    beforeEach(function () {
      result = { _source: { hits: content.documents, total: content.documents.length }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'mCreate',
        controller: 'document'
      };
    });

    it('should send the right mCreate query to Kuzzle', function () {
      collection.mCreateDocument(content.documents, options, sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, { body: content }, options);
    });

    it('should handle invalid argument', function () {
      should(function () { collection.mCreateDocument(); }).throw(Error);
    });

    it('should handle Document objects and promises', function() {
      content.documents.push(new Document(collection, 'foo3', {foo: 'bar'}));

      should(collection.mCreateDocumentPromise(content.documents)).be.fulfilled();

      kuzzle.query.yield(null, { result: result });
    });

    it('should return an array with successfully created documents ids', function (done) {
      this.timeout(50);

      collection.mCreateDocument(content.documents, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result);
        done();
      });

      should(kuzzle.query).be.calledOnce();

      kuzzle.query.yield(null, { result: result });
    });
  });

  describe('#mCreateOrReplaceDocument', function () {
    var content = { documents: [
        { _id: 'foo1', foo: 'bar' },
        { _id: 'foo2', foo: 'bar' }
      ]},
      options = { queuable: false };

    beforeEach(function () {
      result = { _source: { hits: content.documents, total: content.documents.length }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'mCreateOrReplace',
        controller: 'document'
      };
    });

    it('should send the right mCreateOrReplace query to Kuzzle', function () {
      collection.mCreateOrReplaceDocument(content.documents, options, sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, { body: content }, options);
    });

    it('should handle invalid argument', function () {
      should(function () { collection.mCreateOrReplaceDocument(); }).throw(Error);
    });

    it('should handle Document objects and promises', function() {
      content.documents.push(new Document(collection, 'foo3', {foo: 'bar'}));

      should(collection.mCreateOrReplaceDocumentPromise(content.documents)).be.fulfilled();

      kuzzle.query.yield(null, { result: result });
    });

    it('should return an array with successfully created or replaced documents ids', function (done) {
      this.timeout(50);

      collection.mCreateOrReplaceDocument(content.documents, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result);
        done();
      });

      should(kuzzle.query).be.calledOnce();

      kuzzle.query.yield(null, { result: result });
    });
  });

  describe('#mDeleteDocument', function () {
    var
      content = { ids: ['foo1', 'foo2']},
      options = { queuable: false };

    beforeEach(function () {
      result = { _source: content };
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'mDelete',
        controller: 'document'
      };
    });

    it('should send the right mDelete query to Kuzzle', function () {
      collection.mDeleteDocument(content.ids, options, sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, { body: content }, options);
    });

    it('should handle invalid argument', function () {
      should(function () { collection.mDeleteDocument(); }).throw(Error);
    });

    it('should handle promises', function() {
      should(collection.mDeleteDocumentPromise(content.ids)).be.fulfilled();

      kuzzle.query.yield(null, { result: result });
    });

    it('should return an array with successfully deleted documents ids', function (done) {
      this.timeout(50);

      collection.mDeleteDocument(content.ids, function (err, res) {
        should(res).should.be.instanceof(Object);
        should(res).match(result);
        done();
      });

      kuzzle.query.yield(null, { result: result });
    });
  });

  describe('#mGetDocument', function () {
    var content = { documents: [
        { _id: 'foo1', foo: 'bar' },
        { _id: 'foo2', foo: 'bar' }
      ]},
      argument = { ids: ['foo1', 'foo2'] },
      options = { queuable: false };

    beforeEach(function () {
      result = { _source: { hits: content.documents, total: content.documents.length }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'mGet',
        controller: 'document'
      };
    });

    it('should send the right mGet query to Kuzzle', function () {
      collection.mGetDocument(argument.ids, options, sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, { body: argument }, options);
    });

    it('should handle invalid argument', function () {
      should(function () { collection.mGetDocument(); }).throw(Error);
    });

    it('should handle promises', function() {
      should(collection.mGetDocumentPromise(argument.ids)).be.fulfilled();

      kuzzle.query.yield(null, { result: result });
    });

    it('should return an array with successfully retrieved documents', function (done) {
      this.timeout(50);

      collection.mGetDocument(argument.ids, function (err, res) {
        should(res).should.be.instanceof(Object);
        should(res).match(result);
        done();
      });

      kuzzle.query.yield(null, { result: result });
    });
  });

  describe('#mReplaceDocument', function () {
    var content = { documents: [
        { _id: 'foo1', foo: 'bar' },
        { _id: 'foo2', foo: 'bar' }
      ]},
      options = { queuable: false };

    beforeEach(function () {
      result = { _source: { hits: content.documents, total: content.documents.length }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'mReplace',
        controller: 'document'
      };
    });

    it('should send the right mReplace query to Kuzzle', function () {
      collection.mReplaceDocument(content.documents, options, sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, { body: content }, options);
    });

    it('should handle invalid argument', function () {
      should(function () { collection.mReplaceDocument(); }).throw(Error);
    });

    it('should handle Document objects and promises', function() {
      content.documents.push(new Document(collection, 'foo3', {foo: 'bar'}));

      should(collection.mReplaceDocumentPromise(content.documents)).be.fulfilled();

      kuzzle.query.yield(null, { result: result });
    });

    it('should return an array with successfully replaced documents', function (done) {
      this.timeout(50);

      collection.mReplaceDocument(content.documents, function (err, res) {
        should(res).should.be.instanceof(Object);
        should(res).match(result);
        done();
      });

      kuzzle.query.yield(null, { result: result });
    });
  });

  describe('#mUpdateDocument', function () {
    var content = { documents: [
        { _id: 'foo1', foo: 'bar' },
        { _id: 'foo2', foo: 'bar' }
      ]},
      options = { queuable: false };

    beforeEach(function () {
      result = { _source: { hits: content.documents, total: content.documents.length }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'mUpdate',
        controller: 'document'
      };
    });

    it('should send the right mUpdate query to Kuzzle', function () {
      collection.mUpdateDocument(content.documents, options, sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, { body: content }, options);
    });

    it('should handle invalid argument', function () {
      should(function () { collection.mUpdateDocument(); }).throw(Error);
    });

    it('should handle Document objects and promises', function() {
      content.documents.push(new Document(collection, 'foo3', {foo: 'bar'}));

      should(collection.mUpdateDocumentPromise(content.documents)).be.fulfilled();

      kuzzle.query.yield(null, { result: result });
    });

    it('should return an array with successfully updated documents', function (done) {
      this.timeout(50);

      collection.mUpdateDocument(content.documents, function (err, res) {
        should(res).should.be.instanceof(Object);
        should(res).match(result);
        done();
      });

      kuzzle.query.yield(null, { result: result });
    });
  });

  describe('#getSpecifications', function () {
    beforeEach(function () {
      result = {
        result: {
          validation: {
            strict: true,
            fields: {
              foo: {
                mandatory: true,
                type: 'string',
                defaultValue: 'bar'
              }
            }
          }
        }
      };
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'getSpecifications',
        controller: 'collection'
      };
    });

    it('should send the right getSpecifications query to Kuzzle', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      collection.getSpecifications(options, function (err, res) {
        should(err).be.null();
        should(res).match(result.result);
        done();
      });
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, { index: expectedQuery.index, collection: expectedQuery.collection }, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.getSpecifications(); }).throw(Error);
      should(function () { collection.getSpecifications({}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.getSpecifications(cb1);
      collection.getSpecifications({}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.getSpecifications({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#publishMessage', function () {
    var content = {foo: 'bar'};

    beforeEach(function () {
      result = { result: {_source: content}};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'publish',
        controller: 'realtime'
      };
    });

    it('should send the right publish query to Kuzzle', function () {
      var options = { queuable: false };

      collection.publishMessage(content, options);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: content}, options);
    });

    it('should handle a Document object as an argument', function () {
      var options = { queuable: false };

      collection.publishMessage(new Document(collection, content), options);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: content, meta: {}}, options);
    });
  });

  describe('#replaceDocument', function () {
    var content = {foo: 'bar'};

    beforeEach(function () {
      result = { result: {_id: 'foobar', _source: content}};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'createOrReplace',
        controller: 'document'
      };
    });

    it('should send the right replaceDocument query to Kuzzle', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      should(collection.replaceDocument('foobar', content, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        done();
      })).be.exactly(collection);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', body: content}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should handle arguments correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.replaceDocument('foo', {}, cb1);
      collection.replaceDocument('foo', {}, {}, cb2);

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      collection.replaceDocument('foo');
      collection.replaceDocument('foo', {});

      should(kuzzle.query).be.calledTwice();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.replaceDocument(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#searchSpecifications', function () {
    beforeEach(function () {
      result = {
        result: {
          total: 2,
          hits: [
            { _id: 'foo#bar', _source: { validation: { strict: true, fields: { foo: { mandatory: true, type: 'string', defaultValue: 'bar' } } } }, index: 'foo', collection: 'bar' },
            { _id: 'bar#foo', _source: { validation: { strict: true, fields: { bar: { mandatory: true, type: 'string', defaultValue: 'foo' } } } }, index: 'bar', collection: 'foo' },
          ],
          scrollId: '1337'
        }
      };
      expectedQuery = {
        action: 'searchSpecifications',
        controller: 'collection'
      };
    });

    it('should send the right searchSpecifications query to Kuzzle and retrieve the scrollId if exists', function (done) {
      var
        options = { scroll: '30s', queuable: false },
        filters = { match_all: { boost: 1 } };

      this.timeout(50);

      collection.searchSpecifications(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.instanceOf(Object).and.match(result.result);
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.hits).be.an.Array();
        should(res.hits.length).be.exactly(result.result.hits.length);
        should(res.scrollId).be.exactly('1337');

        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, { body: { query: filters } }, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.searchSpecifications(); }).throw(Error);
      should(function () { collection.searchSpecifications({}); }).throw(Error);
      should(function () { collection.searchSpecifications({}, {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.searchSpecifications({}, cb1);
      collection.searchSpecifications({}, {}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.searchSpecifications({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#subscribe', function () {
    beforeEach(function () {
      kuzzle.state = 'connected';
      kuzzle.network = new NetworkWrapperMock();
      result = { result: {roomId: 'foobar' }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'subscribe',
        controller: 'realtime'
      };
    });

    it('should instantiate a new Room object', function () {
      should(collection.subscribe({}, {}, sinon.stub())).be.instanceof(SubscribeResult);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery);
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.subscribe({}, {}, cb1);
      collection.subscribe({}, cb2);

      should(kuzzle.query).be.calledTwice();
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.subscribe({}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });
  });

  describe('#truncate', function () {
    beforeEach(function () {
      result = { result: {acknowledged: true }};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'truncate',
        controller: 'collection'
      };
    });

    it('should send the right truncate query to Kuzzle', function () {
      var options = { queuable: false };

      should(collection.truncate(options, sinon.stub())).be.exactly(collection);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {}, options, sinon.match.func);
    });

    it('should handle arguments correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.truncate({}, cb1);
      collection.truncate(cb2);

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      collection.truncate();
      collection.truncate({});

      should(kuzzle.query).be.calledTwice();
    });
  });

  describe('#updateDocument', function () {
    var
      content = {foo: 'bar'},
      revert,
      refreshed;

    beforeEach(function () {
      revert = Collection.__set__('Document', function (c) {
        var doc = new Document(c, 'foo', {});

        doc.refresh = function (cb) {
          refreshed = true;
          cb(null, doc);
        };

        return doc;
      });

      refreshed = false;
      result = { result: {_id: 'foobar', _source: content}};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'update',
        controller: 'document'
      };
    });

    afterEach(function () {
      revert();
    });

    it('should send the right updateDocument query to Kuzzle', function (done) {
      var options = { queuable: false, retryOnConflict: 42 };

      this.timeout(50);

      should(collection.updateDocument('foobar', content, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document);
        should(refreshed).be.true();
        done();
      })).be.exactly(collection);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foobar', retryOnConflict: 42, body: content}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should handle arguments correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.updateDocument('foo', {}, cb1);
      collection.updateDocument('foo', {}, {}, cb2);

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      collection.updateDocument('foo');
      collection.updateDocument('foo', {});

      should(kuzzle.query).be.calledTwice();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.updateDocument(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#updateSpecifications', function () {
    var
      content = {
        strict: true,
        fields: {
          foo: {
            mandatory: true,
            type: 'string',
            defaultValue: 'bar'
          }
        }
      };

    beforeEach(function () {
      result = { result: { bar: { foo: content } } };
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'updateSpecifications',
        controller: 'collection'
      };
    });

    it('should send the right updateSpecifications query to Kuzzle', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      should(collection.updateSpecifications(content, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object().and.match(result.result);
        done();
      })).be.exactly(collection);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, { body: { bar: { foo: content } } }, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should handle arguments correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.updateSpecifications(content, cb1);
      collection.updateSpecifications(content, {}, cb2);

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      collection.updateSpecifications(content);
      collection.updateSpecifications(content, {});

      should(kuzzle.query).be.calledTwice();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.updateSpecifications(content, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#validateSpectifications', function () {
    var
      content = {
        strict: true,
        fields: {
          foo: {
            mandatory: true,
            type: 'string',
            defaultValue: 'bar'
          }
        }
      };

    beforeEach(function () {
      result = { result: { valid: true } };
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'validateSpecifications',
        controller: 'collection'
      };
    });

    it('should send the right validateSpecifications query to Kuzzle', function (done) {
      var options = { queuable: false };

      this.timeout(50);

      collection.validateSpecifications(content, options, function (err, res) {
        should(err).be.null();
        should(res).be.True();
        done();
      });

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).be.calledWith(expectedQuery, { body: { bar: { foo: content } } }, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { collection.validateSpecifications(content); }).throw(Error);
      should(function () { collection.validateSpecifications(content, {}); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should handle the callback argument correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      collection.validateSpecifications(content, cb1);
      collection.validateSpecifications(content, {}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should call the callback with an error if one occurs', function (done) {
      this.timeout(50);

      collection.validateSpecifications(content, {}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#factories', function () {
    it('document should return a new Document object', function () {
      should(collection.document('foo', { foo: 'bar'})).be.instanceof(Document);
    });

    it('room should return a new Room object', function () {
      should(collection.room()).be.instanceof(Room);
    });

    it('collectionMapping should return a CollectionMapping object', function () {
      should(collection.collectionMapping({})).be.instanceof(CollectionMapping);
    });
  });
});
