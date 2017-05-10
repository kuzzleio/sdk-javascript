var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle'),
  CollectionMapping = require('../../src/CollectionMapping');

describe('CollectionMapping methods', function () {
  var
    expectedQuery,
    result,
    kuzzle,
    collection;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
    collection = kuzzle.collection('foo', 'bar');
  });

  describe('#apply', function () {
    var
      content = { properties: { foo: {type: 'date'}}},
      mapping;

    beforeEach(function () {
      mapping = new CollectionMapping(collection, content.properties);
      mapping.refresh = sinon.stub();
      result = { result: {_source: content}};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'updateMapping',
        controller: 'collection'
      };
    });

    it('should call the right updateMapping query when invoked', function () {
      var options = { queuable: false};

      this.timeout(50);

      should(mapping.apply(options, sinon.stub())).be.exactly(mapping);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: content}, options, sinon.match.func);

      kuzzle.query.reset();
      mapping.headers = {foohead: 'barhead'};
      mapping.apply(options, sinon.stub());

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: content, foohead: 'barhead'}, options, sinon.match.func);
    });

    it('should call refresh() method when invoked', function (done) {
      var options = { queuable: false};

      this.timeout(50);

      should(mapping.apply(options, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(mapping);
        done();
      })).be.exactly(mapping);

      kuzzle.query.yield(null, result);

      should(mapping.refresh).be.calledOnce();
      should(mapping.refresh).calledWith(options, sinon.match.func);
      mapping.refresh.yield(null, mapping);
    });

    it('should handle arguments correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      mapping.apply(cb1);
      mapping.apply({}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(mapping.refresh).be.calledTwice();

      mapping.refresh.yield(null, mapping);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      mapping.refresh.reset();
      mapping.apply();
      mapping.apply({});

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(mapping.refresh).be.calledTwice();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      this.timeout(50);

      mapping.apply(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#refresh', function () {
    var mapping;

    beforeEach(function () {
      mapping = new CollectionMapping(collection);
      result = { result: {bar: { mappings: { foo: { properties: { foo: {type: 'date'}}}}}}};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'getMapping',
        controller: 'collection'
      };
    });

    it('should call the right getMapping query when invoked', function (done) {
      var options = { queuable: false};

      this.timeout(50);

      should(mapping.refresh(options, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(mapping);
        should(res.mapping).match(result.result[collection.index].mappings.foo.properties);
        done();
      })).be.exactly(mapping);

      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {}, options, sinon.match.func);

      kuzzle.query.yield(null, result);
    });

    it('should handle arguments correctly', function () {
      var
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      mapping.refresh(cb1);
      mapping.refresh({}, cb2);

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();

      mapping.refresh();
      mapping.refresh({});
      should(kuzzle.query).be.calledTwice();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      this.timeout(50);

      mapping.refresh(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });

    it('should return a "no mapping" error if the index is not found in the mapping', function (done) {
      result = { result: {foobar: { mappings: { foo: { properties: { foo: {type: 'date'}}}}}}};

      mapping.refresh(function (err, res) {
        should(err).be.an.Error();
        should(err.message).startWith('No mapping found for index');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield(null, result);
    });

    it('should return a "no mapping" error if the collection is not found in the mapping', function (done) {
      result = { result: {bar: { mappings: { foobar: { properties: { foo: {type: 'date'}}}}}}};

      mapping.refresh(function (err, res) {
        should(err).be.an.Error();
        should(err.message).startWith('No mapping found for collection');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield(null, result);
    });

    it('should return an empty mapping if the stored mapping is empty', function (done) {
      result = { result: {bar: { mappings: { foo: {}}}}};

      mapping.refresh(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(mapping);
        should(res.mapping).be.empty().and.not.be.undefined();
        done();
      });
      kuzzle.query.yield(null, result);
    });
  });

  describe('#set', function () {
    it('should allow setting a field mapping', function () {
      var mapping = new CollectionMapping(collection);

      should(mapping.set('foo', { type: 'date'})).be.exactly(mapping);
      should(mapping.mapping.foo).match({type: 'date'});

      mapping.set('bar', {type: 'string'});
      should(mapping.mapping.bar).match({type: 'string'});

      mapping.set('foo', {type: 'string'});
      should(mapping.mapping.bar).match({type: 'string'});
    });
  });

  describe('#setHeaders', function () {
    it('should allow setting headers', function () {
      var
        mapping = new CollectionMapping(collection),
        header = {foohead: 'barhead'};

      should(mapping.setHeaders(header)).be.exactly(mapping);
      should(mapping.headers).match(header);
    });
  });
});
