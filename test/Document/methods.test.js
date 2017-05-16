var
  should = require('should'),
  sinon = require('sinon'),
  Kuzzle = require('../../src/Kuzzle'),
  Collection = require('../../src/Collection.js'),
  Document = require('../../src/Document'),
  SubscribeResult = require('../../src/SubscribeResult');

describe('Document methods', function () {
  var
    expectedQuery,
    result,
    kuzzle,
    collection;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual'});
    kuzzle.query = sinon.stub();
    collection = new Collection(kuzzle, 'foo', 'bar');
  });

  describe('#toJSON', function () {
    it('should serialize itself properly', function () {
      var
        document = new Document(collection, {some: 'content'}),
        serialized = document.serialize();

      should(serialized._id).be.undefined();
      should(serialized._version).be.undefined();
      should(serialized.body).be.an.Object().and.match({some: 'content'});

      document.id = 'foo';
      serialized = document.serialize();
      should(serialized._id).be.exactly('foo');
      should(serialized._version).be.undefined();
      should(serialized.body).be.an.Object().and.match({some: 'content'});

      document.version = 42;
      serialized = document.serialize();
      should(serialized._id).be.exactly('foo');
      should(serialized._version).be.exactly(42);
      should(serialized.body).be.an.Object().and.match({some: 'content'});
    });
  });

  describe('#toString', function () {
    it('should stringify itself properly', function () {
      var
        document = new Document(collection, 'id', {some: 'content', _version: 42}),
        serialized = document.serialize(),
        stringified = document.toString();

      should(stringified).be.a.String();
      should(JSON.parse(stringified)).be.an.Object().and.match(serialized);
    });
  });

  describe('#delete', function () {
    beforeEach(function () {
      result = {};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'delete',
        controller: 'document'
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new Document(collection);

      document.id = 'foo';
      document.delete(options);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foo', body: {}, meta: {}}, options);
    });

    it('should handle arguments correctly', function () {
      var
        document = new Document(collection),
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      document.id = 'foo';
      document.delete(cb1);
      document.delete({}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      document.delete();
      document.delete({});
      should(kuzzle.query).be.calledTwice();
    });

    it('should throw an error if no ID has been set', function () {
      var document = new Document(collection);

      should(function () { document.delete(); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should resolve the callback with its own id as a result', function (done) {
      var document = new Document(collection);

      this.timeout(50);
      document.id = 'foo';

      document.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(document.id);
        done();
      });
      kuzzle.query.yield(null, result);
    });

    it('should revolve the callback with an error if one occurs', function (done) {
      var document = new Document(collection);

      this.timeout(50);
      document.id = 'foo';

      document.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#exists', function () {
    beforeEach(function () {
      result = { result: true };
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'exists',
        controller: 'document'
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new Document(collection);

      document.id = 'foo';
      document.exists(options);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foo', body: {}, meta: {}}, options);
    });

    it('should handle arguments correctly', function () {
      var
        document = new Document(collection),
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      document.id = 'foo';

      document.exists(cb1);
      document.exists({}, cb2);

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      document.exists();
      document.exists({});

      should(kuzzle.query).be.calledTwice();
    });

    it('should throw an error if no ID has been set', function () {
      should(function () { document.exists(); }).throw(Error);
      should(function () { document.exists({}); }).throw(Error);
      should(function () { document.exists(sinon.stub()); }).throw(Error);
      should(function () { document.exists({}, sinon.stub()); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should resolve the callback with true as the result', function (done) {
      var document = new Document(collection);

      this.timeout(50);
      document.id = 'foo';

      document.exists(function (err, res) {
        should(err).be.null();
        should(res).be.true();
        done();
      });

      should(kuzzle.query).be.calledOnce();
      kuzzle.query.yield(null, result);
    });

    it('should revolve the callback with an error if one occurs', function (done) {
      var document = new Document(collection);

      this.timeout(50);
      document.id = 'foo';

      document.exists(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#refresh', function () {
    beforeEach(function () {
      result = { result: {_id: 'foo', _version: 42, _source: {some: 'content'}}};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'get',
        controller: 'document'
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new Document(collection);

      document.id = 'foo';
      document.refresh(options, sinon.stub());
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foo'}, options, sinon.match.func);
    });

    it('should throw an error if no ID has been set', function () {
      var document = new Document(collection);

      should(function () { document.refresh(sinon.stub()); }).throw(Error);
      should(kuzzle.query).not.be.called();
    });

    it('should throw an error if no callback is provided', function () {
      var
        document = new Document(collection);

      document.id = 'foo';
      should(function () { document.refresh(); }).throw();
      should(kuzzle.query).not.be.called();
    });

    it('should handle arguments correctly', function () {
      var
        document = new Document(collection),
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      document.id = 'foo';
      document.refresh(cb1);
      document.refresh({}, cb2);

      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();
    });

    it('should resolve the callback with itself as a result', function (done) {
      var document = new Document(collection);

      this.timeout(50);
      document.id = 'foo';

      document.refresh(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(Document).and.not.be.eql(document);
        should(res.id).be.eql(document.id);
        should(res.version).be.exactly(42);
        should(res.content).match({some:'content'});
        done();
      });

      kuzzle.query.yield(null, result);
    });

    it('should revolve the callback with an error if one occurs', function (done) {
      var document = new Document(collection);

      this.timeout(50);
      document.id = 'foo';

      document.refresh(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#save', function () {
    beforeEach(function () {
      result = {result: { _id: 'foo', _version: 42}};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'createOrReplace',
        controller: 'document'
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new Document(collection);

      document.id = 'foo';
      should(document.save(options)).be.exactly(document);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {_id: 'foo', body: {}, meta: {}}, options);
    });

    it('should handle arguments correctly', function () {
      var
        document = new Document(collection),
        cb1 = sinon.stub(),
        cb2 = sinon.stub();

      document.save(cb1);
      document.save({}, cb2);
      should(kuzzle.query).be.calledTwice();

      kuzzle.query.yield(null, result);
      should(cb1).be.calledOnce();
      should(cb2).be.calledOnce();

      kuzzle.query.reset();
      document.save();
      document.save({});
      should(kuzzle.query).be.calledTwice();
    });

    it('should resolve the callback with itself as a result', function (done) {
      var document = new Document(collection);

      this.timeout(50);

      document.save(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(document);
        should(res.id).be.exactly('foo');
        should(res.version).be.exactly(42);
        done();
      });
      kuzzle.query.yield(null, result);
    });

    it('should revolve the callback with an error if one occurs', function (done) {
      var document = new Document(collection);

      this.timeout(50);

      document.save(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
      kuzzle.query.yield('foobar');
    });
  });

  describe('#publish', function () {
    beforeEach(function () {
      result = {};
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'publish',
        controller: 'realtime'
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new Document(collection);

      should(document.publish(options)).be.exactly(document);
      should(kuzzle.query).be.calledOnce();
      should(kuzzle.query).calledWith(expectedQuery, {body: {}, meta: {}}, options);
    });

    it('should handle arguments correctly', function () {
      var document = new Document(collection);

      document.publish();
      document.publish({});
      should(kuzzle.query).be.calledTwice();
    });
  });

  describe('#setContent', function () {
    it('should update the content if "replace" is falsey', function () {
      var document = new Document(collection);

      document.content = { foo: 'foo', bar: 'bar' };
      should(document.setContent({foo: 'foobar'})).be.exactly(document);
      document.setContent({qux: 'qux'}, false);
      should(document.content).match({foo: 'foobar', bar: 'bar', qux: 'qux'});
    });

    it('should replace the current content if "replace" is true', function () {
      var document = new Document(collection);

      document.content = { foo: 'foo', bar: 'bar' };
      should(document.setContent({foo: 'foobar'}, true)).be.exactly(document);
      should(document.content).match({foo: 'foobar'});
    });
  });

  describe('#subscribe', function () {
    beforeEach(function () {
      collection.subscribe = sinon.stub().returns(new SubscribeResult());
    });

    it('should call collection.subscribe() method with the right arguments', function () {
      var
        filters = {ids: {values: ['foo']}},
        options = {foo: 'bar'},
        document = new Document(collection);

      document.id = 'foo';
      should(document.subscribe(options, sinon.stub())).be.instanceof(SubscribeResult);
      should(document.subscribe(sinon.stub())).be.instanceof(SubscribeResult);
      should(collection.subscribe).be.calledTwice();
      should(collection.subscribe.firstCall).be.calledWith(filters, options, sinon.match.func);
      should(collection.subscribe.secondCall).be.calledWith(filters, null, sinon.match.func);
    });

    it('should throw an error if no ID is provided', function () {
      var document = new Document(collection);

      should(function () { document.subscribe(function () {}); }).throw(Error);
      should(collection.subscribe).not.be.called();
    });
  });

  describe('#setHeaders', function () {
    it('should properly set headers', function () {
      var
        document = new Document(collection),
        header = {_id: 'foobar'};

      should(document.setHeaders(header)).be.exactly(document);
      should(document.headers).match(header);
    });
  });
});
