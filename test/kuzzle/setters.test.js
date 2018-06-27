const
  should = require('should'),
  sinon = require('sinon'),
  NetworkWrapperMock = require('../mocks/networkWrapper.mock'),
  Kuzzle = require('../../src/Kuzzle');

describe('Kuzzle setters', () => {
  let kuzzle;

  beforeEach(() => {
    const network = new NetworkWrapperMock({host: 'somewhere'});
    kuzzle = new Kuzzle(network);
  });

  describe('#autoQueue', () => {
    it('should throw if not a boolean', () => {
      should(function() {
        kuzzle.autoQueue = 'foo-bar';
      }).throw();
    });

    it('should set network.autoQueue property', () => {
      should(kuzzle.network.autoQueue).be.undefined();

      kuzzle.autoQueue = true;
      should(kuzzle.network.autoQueue).be.a.Boolean().and.be.true();

      kuzzle.autoQueue = false;
      should(kuzzle.network.autoQueue).be.a.Boolean().and.be.false();
    });
  });

  describe('#autoReconnect', () => {
    it('should throw if not a boolean', () => {
      should(function() {
        kuzzle.autoReconnect = 'foo-bar';
      }).throw();
    });

    it('should set network.autoReconnect property', () => {
      should(kuzzle.network.autoReconnect).be.undefined();

      kuzzle.autoReconnect = true;
      should(kuzzle.network.autoReconnect).be.a.Boolean().and.be.true();

      kuzzle.autoReconnect = false;
      should(kuzzle.network.autoReconnect).be.a.Boolean().and.be.false();
    });
  });

  describe('#autoReplay', () => {
    it('should throw if not a boolean', () => {
      should(function() {
        kuzzle.autoReplay = 'foo-bar';
      }).throw();
    });

    it('should set network.autoReplay property', () => {
      should(kuzzle.network.autoReplay).be.undefined();

      kuzzle.autoReplay = true;
      should(kuzzle.network.autoReplay).be.a.Boolean().and.be.true();

      kuzzle.autoReplay = false;
      should(kuzzle.network.autoReplay).be.a.Boolean().and.be.false();
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

    it('should set network.offlineQueueLoader property', () => {
      should(kuzzle.network.offlineQueueLoader).be.undefined();

      const cb = sinon.stub();
      kuzzle.offlineQueueLoader = cb;
      should(kuzzle.network.offlineQueueLoader).be.equal(cb);
    });
  });

  describe('#queueFilter', () => {
    it('should throw if not a function', () => {
      should(function() {
        kuzzle.queueFilter = 'foo-bar';
      }).throw();
    });

    it('should set network.queueFilter property', () => {
      should(kuzzle.network.queueFilter).be.undefined();

      const cb = sinon.stub();
      kuzzle.queueFilter = cb;
      should(kuzzle.network.queueFilter).be.equal(cb);
    });
  });

  describe('#queueMaxSize', () => {
    it('should throw if not a number', () => {
      should(function() {
        kuzzle.queueMaxSize = 'foo-bar';
      }).throw();
    });

    it('should set network.queueMaxSize property', () => {
      should(kuzzle.network.queueMaxSize).be.undefined();

      kuzzle.queueMaxSize = 1234;
      should(kuzzle.network.queueMaxSize).be.equal(1234);
    });
  });

  describe('#queueTTL', () => {
    it('should throw if not a number', () => {
      should(function() {
        kuzzle.queueTTL = 'foo-bar';
      }).throw();
    });

    it('should set network.queueTTL property', () => {
      should(kuzzle.network.queueTTL).be.undefined();

      kuzzle.queueTTL = 1234;
      should(kuzzle.network.queueTTL).be.equal(1234);
    });
  });

  describe('#replayInterval', () => {
    it('should throw if not a number', () => {
      should(function() {
        kuzzle.replayInterval = 'foo-bar';
      }).throw();
    });

    it('should set network.replayInterval property', () => {
      should(kuzzle.network.replayInterval).be.undefined();

      kuzzle.replayInterval = 1234;
      should(kuzzle.network.replayInterval).be.equal(1234);
    });
  });
});