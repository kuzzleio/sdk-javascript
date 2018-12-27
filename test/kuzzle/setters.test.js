const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle setters', () => {
  let kuzzle;

  beforeEach(() => {
    const protocol = new ProtocolMock('somewhere');
    kuzzle = new Kuzzle(protocol);
  });

  describe('#autoQueue', () => {
    it('should throw if not a boolean', () => {
      should(function() {
        kuzzle.autoQueue = 'foo-bar';
      }).throw();
    });

    it('should set private _autoQueue property', () => {
      should(kuzzle.protocol.autoQueue).be.undefined();

      kuzzle.autoQueue = true;
      should(kuzzle._autoQueue).be.a.Boolean().and.be.true();

      kuzzle.autoQueue = false;
      should(kuzzle._autoQueue).be.a.Boolean().and.be.false();
    });
  });

  describe('#autoReconnect', () => {
    it('should throw if not a boolean', () => {
      should(function() {
        kuzzle.autoReconnect = 'foo-bar';
      }).throw();
    });

    it('should set protocol.autoReconnect property', () => {
      should(kuzzle.protocol.autoReconnect).be.undefined();

      kuzzle.autoReconnect = true;
      should(kuzzle.protocol.autoReconnect).be.a.Boolean().and.be.true();

      kuzzle.autoReconnect = false;
      should(kuzzle.protocol.autoReconnect).be.a.Boolean().and.be.false();
    });
  });

  describe('#autoReplay', () => {
    it('should throw if not a boolean', () => {
      should(function() {
        kuzzle.autoReplay = 'foo-bar';
      }).throw();
    });

    it('should set priavet _autoReplay property', () => {
      should(kuzzle.protocol.autoReplay).be.undefined();

      kuzzle.autoReplay = true;
      should(kuzzle._autoReplay).be.a.Boolean().and.be.true();

      kuzzle.autoReplay = false;
      should(kuzzle._autoReplay).be.a.Boolean().and.be.false();
    });
  });

  describe('#jwt', () => {
    it('should unset the _jwt property if parameter is null', () => {
      kuzzle._jwt = 'foo-bar';
      kuzzle.jwt = null;
      should(kuzzle._jwt).be.undefined();
    });

    it('should set the _jwt property if parameter is a string', () => {
      kuzzle.jwt = 'foo-bar';
      should(kuzzle._jwt).be.equal('foo-bar');
    });

    it('should set the _jwt property if parameter is an well formated object', () => {
      kuzzle.jwt = {result: {jwt: 'foo-bar'}};
      should(kuzzle._jwt).be.equal('foo-bar');
    });

    it('should throw if parameter is an bad formated object', () => {
      kuzzle._jwt = 'old-jwt';

      should(function() {
        kuzzle.jwt = {foo: 'bar'};
      }).throw();
      should(kuzzle._jwt).be.equal('old-jwt');
    });

    it('should throw if parameter is not a string', () => {
      kuzzle._jwt = 'old-jwt';

      should(function() {
        kuzzle.jwt = 1234;
      }).throw();
      should(kuzzle._jwt).be.equal('old-jwt');
    });
  });

  describe('#offlineQueueLoader', () => {
    it('should throw if not a function', () => {
      should(function() {
        kuzzle.offlineQueueLoader = 'foo-bar';
      }).throw();
    });

    it('should set protocol.offlineQueueLoader property', () => {
      should(kuzzle.offlineQueueLoader).be.null();

      const cb = sinon.stub();
      kuzzle.offlineQueueLoader = cb;
      should(kuzzle.offlineQueueLoader).be.equal(cb);
    });
  });

  describe('#queueFilter', () => {
    it('should throw if not a function', () => {
      should(function() {
        kuzzle.queueFilter = 'foo-bar';
      }).throw();
    });

    it('should set private _queueFilter property', () => {
      should(kuzzle.queueFilter).be.null();

      const cb = sinon.stub();
      kuzzle.queueFilter = cb;
      should(kuzzle._queueFilter).be.equal(cb);
    });
  });

  describe('#queueMaxSize', () => {
    it('should throw if not a number', () => {
      should(function() {
        kuzzle.queueMaxSize = 'foo-bar';
      }).throw();
    });

    it('should set priavert _queueMaxSize property', () => {
      kuzzle.queueMaxSize = 1234;
      should(kuzzle._queueMaxSize).be.equal(1234);
    });
  });

  describe('#queueTTL', () => {
    it('should throw if not a number', () => {
      should(function() {
        kuzzle.queueTTL = 'foo-bar';
      }).throw();
    });

    it('should set private _queueTTL property', () => {
      kuzzle.queueTTL = 1234;
      should(kuzzle._queueTTL).be.equal(1234);
    });
  });

  describe('#replayInterval', () => {
    it('should throw if not a number', () => {
      should(function() {
        kuzzle.replayInterval = 'foo-bar';
      }).throw();
    });

    it('should set private _replayInterval property', () => {
      kuzzle.replayInterval = 1234;
      should(kuzzle._replayInterval).be.equal(1234);
    });
  });

  describe('#flushQueue', () => {
    it('flush the offline queue', () => {
      kuzzle._offlineQueue.push({ foo: 'bar' });

      kuzzle.flushQueue();

      should(kuzzle._offlineQueue).be.empty();
    });
  });
});
