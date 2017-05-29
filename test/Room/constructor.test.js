var
  should = require('should'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../src/Kuzzle'),
  Room = require('../../src/Room');

describe('Room constructor', function () {
  var
    kuzzle,
    collection;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {connect: 'manual', defaultIndex: 'bar'});
    kuzzle.headers = {foo: 'bar'};
    collection = kuzzle.collection('foo');
  });

  it('should handle provided arguments correctly', function () {
    var room = new Room(collection);

    should(room.volatile).be.an.Object().and.be.empty();
    should(room.subscribeToSelf).be.true();
    should(room.scope).be.exactly('all');
    should(room.state).be.exactly('done');
    should(room.users).be.exactly('none');
    should(room.collection).be.exactly(collection);
    should(room.filters).be.null();
    should(room.headers).match({foo: 'bar'});
    should(room.roomId).be.null();

    room = new Room(collection, {
      scope: 'in',
      state: 'pending',
      users: 'all',
      volatile: {some: 'metadata'},
      subscribeToSelf: false
    });

    should(room.volatile).match({some: 'metadata'});
    should(room.subscribeToSelf).be.false();
    should(room.scope).be.exactly('in');
    should(room.state).be.exactly('pending');
    should(room.users).be.exactly('all');
  });

  it('should expose documented properties with the right permissions', function () {
    var room = new Room(collection);

    should(room).have.propertyWithDescriptor('collection', {enumerable: true, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('filters', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('headers', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('scope', {enumerable: false, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('state', {enumerable: false, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('users', {enumerable: false, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('volatile', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('subscribeToSelf', {
      enumerable: true,
      writable: true,
      configurable: false
    });
    should(room).have.propertyWithDescriptor('roomId', {enumerable: true, writable: true, configurable: false});
  });

  it('should promisify the right functions', function () {
    var room;

    kuzzle.bluebird = bluebird;
    room = new Room(collection);

    should.exist(room.countPromise);
    should.not.exist(room.renewPromise);
    should.not.exist(room.setHeadersPromise);
    should.not.exist(room.unsubscribePromise);
  });
});
