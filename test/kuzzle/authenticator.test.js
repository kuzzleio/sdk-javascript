const should = require('should');
const sinon = require('sinon');
const ProtocolMock = require('../mocks/protocol.mock');
const { Kuzzle } = require('../../src/Kuzzle');

describe('Kuzzle authenticator function mecanisms', () => {
  let kuzzle;
  let protocol;

  beforeEach(() => {
    protocol = new ProtocolMock('somewhere');
    kuzzle = new Kuzzle(protocol);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('connected listener', () => {
    let resolve;
    let promise;

    beforeEach(() => {
      kuzzle.auth.checkToken = sinon.stub().resolves(true);
    });

    it('should check the validity of the token at connection to know if we are already logged in', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });

      kuzzle.auth.checkToken.resolves({ valid: true });

      should(kuzzle._loggedIn).be.false();
      kuzzle.emit('connected');

      setTimeout(() => {
        should(kuzzle.auth.checkToken).be.calledOnce();
        should(kuzzle._loggedIn).be.true();
        resolve();
      }, 1);

      return promise;
    });
  });

  describe('loginAttempt listener', () => {
    let resolve;
    let promise;

    beforeEach(() => {
      kuzzle.auth.checkToken = sinon.stub().resolves(true);
    });

    it('should set _loggedIn to true on successful login attempt', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });

      should(kuzzle._loggedIn).be.false();
      kuzzle.emit('loginAttempt', { success: true });

      setTimeout(() => {
        should(kuzzle.auth.checkToken).not.be.calledOnce();
        should(kuzzle._loggedIn).be.true();
        resolve();
      }, 1);

      return promise;
    });

    it('should verify the stored token when the login attempt has failed', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });

      kuzzle.auth.checkToken.resolves({ valid: true });

      should(kuzzle._loggedIn).be.false();
      kuzzle.emit('loginAttempt', { success: false, err: new Error('foo') });

      setTimeout(() => {
        should(kuzzle.auth.checkToken).be.calledOnce();
        should(kuzzle._loggedIn).be.true();
        resolve();
      }, 1);

      return promise;
    });
  });

  describe('logoutAttempt listener', () => {
    let resolve;
    let promise;


    it('should set _loggedIn to false on logout', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });

      kuzzle._loggedIn = true;
      kuzzle.emit('logoutAttempt', { success: true });

      setTimeout(() => {
        should(kuzzle.auth.checkToken).not.be.calledOnce();
        should(kuzzle._loggedIn).be.false();
        resolve();
      }, 1);

      return promise;
    });
  });

  describe('reconnect listener', () => {
    let reconnectedSpy;
    let resolve;
    let promise;

    beforeEach(() => {
      kuzzle.authenticator = async () => {};

      sinon.stub(kuzzle, 'tryReAuthenticate').resolves(true);
      sinon.stub(kuzzle, 'disconnect');

      reconnectedSpy = sinon.stub();
      kuzzle.on('reconnected', reconnectedSpy);
    });

    it('should try to re-authenticate when reconnecting if an authenticator was set we were logged in', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });
      await kuzzle.connect();

      kuzzle._loggedIn = true;

      protocol.emit('reconnect');

      // We need a timeout since the listener on "reconnect" event is asynchronous
      setTimeout(() => {
        should(kuzzle.tryReAuthenticate).be.calledOnce();
        should(reconnectedSpy).be.calledOnce();
        resolve();
      }, 1);

      return promise;
    });

    it('should not try to re-authenticate when reconnecting if we were not logged in', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });
      await kuzzle.connect();

      kuzzle._loggedIn = false;

      protocol.emit('reconnect');

      // We need a timeout since the listener on "reconnect" even is async
      setTimeout(() => {
        should(kuzzle.tryReAuthenticate).not.be.called();
        should(reconnectedSpy).be.calledOnce();
        resolve();
      }, 1);

      return promise;
    });

    it('should not fire the reconnected event and disconnect the SDK if authentication fail', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });
      await kuzzle.connect();
      kuzzle._loggedIn = true;
      kuzzle.tryReAuthenticate.resolves(false);

      protocol.emit('reconnect');

      // We need a timeout since the listener on "reconnect" even is async
      setTimeout(() => {
        should(kuzzle.tryReAuthenticate).be.calledOnce();
        should(kuzzle.disconnect).be.calledOnce();
        resolve();
      }, 1);

      return promise;
    });

    it('should not try to authenticate if no authenticator was set', async () => {
      kuzzle.authenticator = null;
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });
      await kuzzle.connect();
      kuzzle._loggedIn = true;

      protocol.emit('reconnect');

      // We need a timeout since the listener on "reconnect" even is async
      setTimeout(() => {
        should(reconnectedSpy).be.calledOnce();
        resolve();
      }, 1);

      return promise;
    });
  });

  describe('#tryReAuthenticate', () => {
    let reconnectionErrorSpy;

    beforeEach(() => {
      sinon.stub(kuzzle.auth, 'checkToken').resolves({ valid: false });
      sinon.stub(kuzzle, 'authenticate').resolves();

      reconnectionErrorSpy = sinon.stub();
      kuzzle.on('reconnectionError', reconnectionErrorSpy);

      kuzzle.authenticator = () => {};
    });

    it('should returns true if the token is still valid', async () => {
      kuzzle.auth.checkToken.resolves({ valid: true });

      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.true();
      should(kuzzle.authenticate).not.be.called();
      should(reconnectionErrorSpy).not.be.called();
    });

    it('should call "authenticate" if the token is not valid', async () => {
      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.true();
      should(kuzzle.authenticate).be.calledOnce();
      should(reconnectionErrorSpy).not.be.called();
    });

    it('should emit "reconnectionError" if the "authenticator" function fail', async () => {
      kuzzle.authenticate.rejects('auth fail');

      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.false();
      should(reconnectionErrorSpy).be.called();
    });
  });

  describe('#authenticate', () => {
    beforeEach(() => {
      kuzzle.authenticator = async () => {};

      sinon.stub(kuzzle.auth, 'checkToken').resolves({ valid: true });

      sinon.spy(kuzzle, 'authenticator');
    });

    it('should execute the "authenticator"', async () => {
      await kuzzle.authenticate();

      should(kuzzle.authenticator).be.calledOnce();
      should(kuzzle.auth.checkToken).be.calledOnce();
    });

    it('should throw an error if the "authenticator" is not set', () => {
      kuzzle.authenticator = null;

      should(kuzzle.authenticate()).be.rejected();
    });

    it('should throw an error if the "authenticator" does not authenticate the SDK', () => {
      kuzzle.auth.checkToken.resolves({ valid: false });

      should(kuzzle.authenticate()).be.rejected();
    });
  });
});
