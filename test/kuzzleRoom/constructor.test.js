var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleRoom = rewire('../../src/kuzzleRoom');

describe('KuzzleRoom constructor', function () {
  var
    kuzzle,
    dataCollection;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('nowhere');

    kuzzle.headers = {foo: 'bar'};
    dataCollection = kuzzle.dataCollectionFactory('foo');
  });

  it('should handle provided arguments correctly', function () {
    var room = new KuzzleRoom(dataCollection);

    should(room.listenToConnections).be.false();
    should(room.listenToDisconnections).be.false();
    should(room.metadata).be.an.Object().and.be.empty();
    should(room.subscribeToSelf).be.false();
    should(room.collection).be.exactly('foo');
    should(room.filters).be.null();
    should(room.headers).match({foo: 'bar'});
    should(room.roomId).be.null();

    room = new KuzzleRoom(dataCollection, {
      listenToConnections: true,
      listenToDisconnections: true,
      metadata: {some: 'metadata'},
      subscribeToSelf: true
    });

    should(room.listenToConnections).be.true();
    should(room.listenToDisconnections).be.true();
    should(room.metadata).match({some: 'metadata'});
    should(room.subscribeToSelf).be.true();
  });

  it('should expose documented properties with the right permissions', function () {
    var room = new KuzzleRoom(dataCollection);

    should(room).have.propertyWithDescriptor('collection', {enumerable: true, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('filters', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('headers', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('listenToConnections', {
      enumerable: true,
      writable: true,
      configurable: false
    });
    should(room).have.propertyWithDescriptor('listenToDisconnections', {
      enumerable: true,
      writable: true,
      configurable: false
    });
    should(room).have.propertyWithDescriptor('metadata', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('subscribeToSelf', {
      enumerable: true,
      writable: true,
      configurable: false
    });
    should(room).have.propertyWithDescriptor('roomId', {enumerable: true, writable: true, configurable: false});
  });

  it('should promisify the right functions', function () {
    var room = new KuzzleRoom(dataCollection);

    should.exist(room.countPromise);
    should.not.exist(room.renewPromise);
    should.not.exist(room.setHeadersPromise);
    should.not.exist(room.unsubscribePromise);
  });
});
