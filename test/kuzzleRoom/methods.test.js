var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleRoom = require('../../src/kuzzleRoom');

describe('KuzzleRoom methods', function () {
  var
    expectedQuery,
    error,
    result,
    queryStub = function (collection, controller, action, query, options, cb) {
      if (!cb && typeof options === 'function') {
        cb = options;
        options = null;
      }
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


  describe('#count', function () {
    var room;

    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { count: 42 };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'count',
        controller: 'subscribe',
        body: {}
      };
      room = new KuzzleRoom(dataCollection);
    });

    it('should send the right query to Kuzzle', function () {
      should(room.count(function () {})).be.exactly(room);
      should(emitted).be.true();
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { room.count();}).throw(Error);
      should(emitted).be.false();
    });

    it('should delay the request until after subscribing', function () {
      var cb = function () {};
      room.subscribing = true;
      should(room.count(cb)).be.exactly(room);
      should(emitted).be.false();
      should(room.queue).match([{action: 'count', args: [cb]}]);
    });

    it('should answer with the number of subscribers', function (done) {
      this.timeout(50);

      room.count(function (err, res) {
        should(err).be.null();
        should(res).be.a.Number().and.be.exactly(42);
        done();
      });
    });

    it('should resolve the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      room.count(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#renew', function () {
    var room;

    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { roomId: 'foobar' };
      error = null;
      expectedQuery = {
        collection: 'foo',
        action: 'on',
        controller: 'subscribe',
        body: {}
      };
      room = new KuzzleRoom(dataCollection);
    });

    it('should send the right query to Kuzzle', function () {
      should(room.renew({}, function () {})).be.exactly(room);
      should(emitted).be.true();
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { room.renew();}).throw(Error);
      should(emitted).be.false();
    });

    it('should handle arguments properly', function () {
      room.renew(function () {});
      should(emitted).be.true();
    });

    it('should delay the request until after subscribing', function () {
      var cb = function () {};
      room.subscribing = true;
      should(room.renew({}, cb)).be.exactly(room);
      should(emitted).be.false();
      should(room.queue).match([{action: 'renew', args: [{}, cb]}]);
    });
  });
});
