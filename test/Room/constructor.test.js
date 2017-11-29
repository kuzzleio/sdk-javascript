var
  should = require('should'),
  bluebird = require('bluebird'),
  CollectionMock = require('../mocks/collection.mock'),
  KuzzleMock = require('../mocks/kuzzle.mock'),
  Room = require('../../src/Room');

describe('Room constructor', function () {
  var
    kuzzle,
    collection;

  beforeEach(function () {
    kuzzle = new KuzzleMock();
    kuzzle.autoResubscribe = true;
    collection = new CollectionMock(kuzzle);
  });

  it('should handle provided arguments correctly', function () {
    var room = new Room(collection, {equals: {foo: 'bar'}});

    should(room.volatile).be.an.Object().and.be.empty();
    should(room.subscribeToSelf).be.true();
    should(room.autoResubscribe).be.true();
    should(room.scope).be.exactly('all');
    should(room.state).be.exactly('done');
    should(room.users).be.exactly('none');
    should(room.collection).be.exactly(collection);
    should(room.filters).match({equals: {foo: 'bar'}});
    should(room.roomId).be.null();


    room = new Room(collection, {equals: {foo: 'bar'}}, {
      scope: 'in',
      state: 'pending',
      users: 'all',
      volatile: {some: 'metadata'},
      subscribeToSelf: false,
      autoResubscribe: false
    });

    should(room.volatile).match({some: 'metadata'});
    should(room.subscribeToSelf).be.false();
    should(room.autoResubscribe).be.false();
    should(room.scope).be.exactly('in');
    should(room.state).be.exactly('pending');
    should(room.users).be.exactly('all');


    kuzzle.autoResubscribe = false;
    room = new Room(collection, {equals: {foo: 'bar'}});
    should(room.autoResubscribe).be.false();
  });

  it('should expose documented properties with the right permissions', function () {
    var room = new Room(collection, {equals: {foo: 'bar'}});

    should(room).have.propertyWithDescriptor('autoResubscribe', {enumerable: true});
    should(room).have.propertyWithDescriptor('collection', {enumerable: true});
    should(room).have.propertyWithDescriptor('filters', {enumerable: true, writable: false});
    should(room).have.propertyWithDescriptor('scope', {enumerable: true});
    should(room).have.propertyWithDescriptor('state', {enumerable: true});
    should(room).have.propertyWithDescriptor('users', {enumerable: true});
    should(room).have.propertyWithDescriptor('volatile', {enumerable: true, writable: true});
    should(room).have.propertyWithDescriptor('subscribeToSelf', {enumerable: true, writable: true});
    should(room).have.propertyWithDescriptor('roomId', {enumerable: true});
  });

  it('should promisify the right functions', function () {
    var room;

    kuzzle.bluebird = bluebird;
    room = new Room(collection, {equals: {foo: 'bar'}});

    should.exist(room.countPromise);
    should.exist(room.onDonePromise);
    should.not.exist(room.notifyPromise);
    should.exist(room.renewPromise);
    should.exist(room.subscribePromise);
    should.exist(room.unsubscribePromise);
  });
});
