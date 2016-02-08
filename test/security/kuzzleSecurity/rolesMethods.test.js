var
  should = require('should'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleRole = require('../../../src/security/kuzzleRole');

describe('KuzzleSecurity roles methods', function () {
  var
    kuzzle,
    expectedQuery,
    result,
    error,
    queryStub = function (args, query, options, cb) {
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
        should(query.body).be.undefined();
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
    };

  describe('#getRole', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _source: {} }};
      expectedQuery = {
        action: 'getRole',
        controller: 'security',
        _id: 'foobar'
      };
    });

    it('should send the right getRole query to Kuzzle', function (done) {
      should(kuzzle.security.getRole(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.getRole('test'); }).throw(Error);
    });

    it('should throw an error when no id is provided', function () {
      should(function () { kuzzle.security.getRole(null, function () {}); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'error';
      this.timeout(50);

      kuzzle.security.getRole('foobar', function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#searchRoles', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: { total: 123, hits: [ {_id: 'myRole', _source: {indexes : {}}} ]}};
      expectedQuery = {
        action: 'searchRoles',
        controller: 'security'
      };
    });

    it('should send the right search query to kuzzle', function (done) {
      var
        filters = { indexes: ['test'] };

      this.timeout(50);
      expectedQuery.body = filters;

      should(kuzzle.security.searchRoles(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.documents).be.an.Array();
        should(res.documents).not.be.empty();
        should(res.documents.length).be.exactly(result.result.hits.length);

        res.documents.forEach(function (item) {
          should(item).be.instanceof(KuzzleRole);
        });

        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      var
        filters = { indexes: ['test'] };

      should(function () { kuzzle.security.searchRoles(filters); }).throw(Error);
    });
  });


  describe('#createRole', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'myRole', _source: {indexes : {}}} };
      expectedQuery = {
        action: 'createRole',
        controller: 'security'
      };
    });

    it('should send the right createRole query to Kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzle.security.createRole(result.result._id, result.result._source, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should construct a createOrReplaceRole action if option replaceIfExist is set', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createOrReplaceRole';

      should(kuzzle.security.createRole(result.result._id, result.result._source, {replaceIfExist: true}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.createRole(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.createRole(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#deleteRole', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'myRole'} };
      expectedQuery = {
        action: 'deleteRole',
        controller: 'security',
        _id: result.result._id
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      should(kuzzle.security.deleteRole(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.deleteRole(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#roleFactory', function () {
    it('should return an instance of Role', function (done) {
      var role = kuzzle.security.roleFactory('test', {index: {}});
      should(role).instanceof(KuzzleRole);
      done();
    });

    it('should throw an error if no id is provided', function (done) {
      should((function () { kuzzle.security.roleFactory(null) })).throw(Error);
      done();
    });
  });
  //
  //describe('#fetchAllDocuments', function () {
  //  beforeEach(function () {
  //    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  //    emitted = false;
  //  });
  //
  //  it('should forward the query to the advancedSearch method', function () {
  //    var
  //      collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
  //      options = { queuable: false };
  //
  //    collection.advancedSearch = function () { emitted = true; };
  //    expectedQuery.options = options;
  //
  //    should(collection.fetchAllDocuments(options, function () {})).be.exactly(collection);
  //    should(emitted).be.true();
  //  });
  //
  //  it('should raise an error if no callback is provided', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //    should(function () { collection.fetchAllDocuments(); }).throw(Error);
  //    should(emitted).be.false();
  //    should(function () { collection.fetchAllDocuments({}); }).throw(Error);
  //    should(emitted).be.false();
  //  });
  //
  //  it('should handle the callback argument correctly', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //
  //    collection.advancedSearch = function () { emitted = true; };
  //
  //    collection.fetchAllDocuments(function () {});
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.fetchAllDocuments({}, function () {});
  //    should(emitted).be.true();
  //  });
  //});
  //
  //describe('#getMapping', function () {
  //  beforeEach(function () {
  //    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  //    kuzzle.query = queryStub;
  //    emitted = false;
  //    result = { result: {'bar': { mappings: { foo: { properties: {}}}} }};
  //    error = null;
  //    expectedQuery = {
  //      index: 'bar',
  //      collection: 'foo',
  //      action: 'getMapping',
  //      controller: 'admin',
  //      body: {}
  //    };
  //  });
  //
  //  it('should instantiate a new KuzzleDataMapping object', function (done) {
  //    var
  //      collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
  //      options = { queuable: false };
  //
  //    expectedQuery.options = options;
  //
  //    should(collection.getMapping(options, function (err, res) {
  //      should(err).be.null();
  //      should(res).be.instanceof(KuzzleDataMapping);
  //      done();
  //    })).be.exactly(collection);
  //    should(emitted).be.true();
  //  });
  //
  //  it('should raise an error if no callback is provided', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //    should(function () { collection.getMapping(); }).throw(Error);
  //    should(emitted).be.false();
  //    should(function () { collection.getMapping({}); }).throw(Error);
  //    should(emitted).be.false();
  //  });
  //
  //  it('should handle the callback argument correctly', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //
  //    collection.getMapping(function () {});
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.getMapping({}, function () {});
  //    should(emitted).be.true();
  //  });
  //
  //  it('should call the callback with an error if one occurs', function (done) {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //    error = 'foobar';
  //    this.timeout(50);
  //
  //    collection.getMapping({}, function (err, res) {
  //      should(err).be.exactly('foobar');
  //      should(res).be.undefined();
  //      done();
  //    });
  //  });
  //});
  //
  //describe('#publishMessage', function () {
  //  beforeEach(function () {
  //    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  //    kuzzle.query = queryStub;
  //    emitted = false;
  //    result = { result: {_source: {foo: 'bar'} }};
  //    error = null;
  //    expectedQuery = {
  //      index: 'bar',
  //      collection: 'foo',
  //      action: 'publish',
  //      controller: 'write',
  //      body: {}
  //    };
  //  });
  //
  //  it('should send the right publish query to Kuzzle', function () {
  //    var
  //      collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
  //      options = { queuable: false };
  //
  //    expectedQuery.options = options;
  //
  //    collection.publishMessage(result.result._source, options);
  //    should(emitted).be.true();
  //  });
  //
  //  it('should handle a KuzzleDocument object as an argument', function () {
  //    var
  //      collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
  //      options = { queuable: false };
  //
  //    expectedQuery.options = options;
  //
  //    collection.publishMessage(new KuzzleDocument(collection, result.result._source), options);
  //    should(emitted).be.true();
  //  });
  //});
  //
  //describe('#replaceDocument', function () {
  //  beforeEach(function () {
  //    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  //    kuzzle.query = queryStub;
  //    emitted = false;
  //    result = { result: {_id: 'foobar', _source: { foo: 'bar' } }};
  //    error = null;
  //    expectedQuery = {
  //      index: 'bar',
  //      collection: 'foo',
  //      action: 'createOrReplace',
  //      controller: 'write',
  //      body: {}
  //    };
  //  });
  //
  //  it('should send the right replaceDocument query to Kuzzle', function (done) {
  //    var
  //      collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
  //      options = { queuable: false };
  //    expectedQuery.options = options;
  //
  //    should(collection.replaceDocument(result.result._id, result.result._source, options, function (err, res) {
  //      should(err).be.null();
  //      should(res).be.instanceof(KuzzleDocument);
  //      done();
  //    })).be.exactly(collection);
  //    should(emitted).be.true();
  //  });
  //
  //  it('should handle arguments correctly', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //
  //    collection.replaceDocument('foo');
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.replaceDocument('foo', {});
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.replaceDocument('foo', {}, function () {});
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.replaceDocument('foo', {}, {}, function () {});
  //    should(emitted).be.true();
  //  });
  //
  //  it('should call the callback with an error if one occurs', function (done) {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //    error = 'foobar';
  //    this.timeout(50);
  //
  //    collection.replaceDocument(result.result._id, result.result._source, function (err, res) {
  //      should(err).be.exactly('foobar');
  //      should(res).be.undefined();
  //      done();
  //    });
  //  });
  //});
  //
  //describe('#subscribe', function () {
  //  beforeEach(function () {
  //    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  //    kuzzle.state = 'connected';
  //    kuzzle.query = queryStub;
  //    emitted = false;
  //    result = { result: {roomId: 'foobar' }};
  //    error = null;
  //    expectedQuery = {
  //      index: 'bar',
  //      collection: 'foo',
  //      action: 'on',
  //      controller: 'subscribe',
  //      body: {}
  //    };
  //  });
  //
  //  it('should instantiate a new KuzzleRoom object', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //
  //    should(collection.subscribe(expectedQuery.body, {}, function () {})).be.instanceof(KuzzleRoom);
  //    should(emitted).be.true();
  //  });
  //
  //  it('should handle arguments correctly', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //
  //    should(collection.subscribe(expectedQuery.body, function () {})).be.instanceof(KuzzleRoom);
  //    should(emitted).be.true();
  //  });
  //
  //  it('should raise an error if no callback is provided', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //    should(function () { collection.subscribe({}); }).throw(Error);
  //    should(emitted).be.false();
  //  });
  //});
  //
  //describe('#truncate', function () {
  //  beforeEach(function () {
  //    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  //    kuzzle.query = queryStub;
  //    emitted = false;
  //    result = { result: {acknowledged: true }};
  //    error = null;
  //    expectedQuery = {
  //      index: 'bar',
  //      collection: 'foo',
  //      action: 'truncateCollection',
  //      controller: 'admin',
  //      body: {}
  //    };
  //  });
  //
  //  it('should send the right truncate query to Kuzzle', function () {
  //    var
  //      collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
  //      options = { queuable: false };
  //
  //    expectedQuery.options = options;
  //
  //    should(collection.truncate(options, function () {})).be.exactly(collection);
  //    should(emitted).be.true();
  //  });
  //
  //  it('should handle arguments correctly', function () {
  //    var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
  //
  //    collection.truncate();
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.truncate({});
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.truncate({}, function () {});
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.truncate(function () {});
  //    should(emitted).be.true();
  //  });
  //});
  //
  //describe('#updateDocument', function () {
  //  var
  //    revert,
  //    refreshed = false;
  //
  //  beforeEach(function () {
  //    revert = KuzzleDataCollection.__set__('KuzzleDocument', function (collection) {
  //      var doc = new KuzzleDocument(collection, 'foo', {});
  //
  //      doc.refresh = function (cb) {
  //        refreshed = true;
  //        cb(null, doc);
  //      };
  //
  //      return doc;
  //    });
  //
  //    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  //    kuzzle.query = queryStub;
  //
  //    emitted = false;
  //    result = { result: {_id: 'foobar', _source: { foo: 'bar' } }};
  //    error = null;
  //    expectedQuery = {
  //      index: 'bar',
  //      collection: 'foo',
  //      action: 'update',
  //      controller: 'write',
  //      body: {}
  //    };
  //  });
  //
  //  afterEach(function () {
  //    revert();
  //  });
  //
  //  it('should send the right updateDocument query to Kuzzle', function (done) {
  //    var
  //      collection = new KuzzleDataCollection(kuzzle, expectedQuery.index, expectedQuery.collection),
  //      options = { queuable: false };
  //    expectedQuery.options = options;
  //
  //    should(collection.updateDocument(result.result._id, result.result._source, options, function (err, res) {
  //      should(err).be.null();
  //      should(res).be.instanceof(KuzzleDocument);
  //      should(refreshed).be.true();
  //      done();
  //    })).be.exactly(collection);
  //    should(emitted).be.true();
  //  });
  //
  //  it('should handle arguments correctly', function () {
  //    var collection = new KuzzleDataCollection(kuzzle, expectedQuery.index, expectedQuery.collection);
  //
  //    collection.updateDocument('foo');
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.updateDocument('foo', {});
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.updateDocument('foo', {}, function () {});
  //    should(emitted).be.true();
  //
  //    emitted = false;
  //    collection.updateDocument('foo', {}, {}, function () {});
  //    should(emitted).be.true();
  //  });
  //
  //  it('should call the callback with an error if one occurs', function (done) {
  //    var collection = new KuzzleDataCollection(kuzzle, expectedQuery.index, expectedQuery.collection);
  //    error = 'foobar';
  //    this.timeout(50);
  //
  //    collection.updateDocument(result.result._id, result.result._source, function (err, res) {
  //      should(err).be.exactly('foobar');
  //      should(res).be.undefined();
  //      done();
  //    });
  //  });
  //});
  //
  //describe('#factories', function () {
  //  beforeEach(function () {
  //    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  //  });
  //
  //  it('documentFactory should return a new KuzzleDocument object', function () {
  //    should(kuzzle.dataCollectionFactory('foo').documentFactory('foo', { foo: 'bar'})).be.instanceof(KuzzleDocument);
  //  });
  //
  //  it('roomFactory should return a new KuzzleRoom object', function () {
  //    should(kuzzle.dataCollectionFactory('foo').roomFactory()).be.instanceof(KuzzleRoom);
  //  });
  //
  //  it('dataMappingFactory should return a KuzzleDataMapping object', function () {
  //    should(kuzzle.dataCollectionFactory('foo').dataMappingFactory({})).be.instanceof(KuzzleDataMapping);
  //  });
  //});
});