const should = require('should');
const sinon = require('sinon');
const ProtocolMock = require('../mocks/protocol.mock');
const { Kuzzle } = require('../../src/Kuzzle');

describe('Kuzzle authenticator function mecanisms', () => {
  let kuzzle;
  let protocol;
  let validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  beforeEach(() => {
    protocol = new ProtocolMock('somewhere');
    kuzzle = new Kuzzle(protocol);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('reconnect listener', () => {
    let reconnectedSpy;
    let resolve;
    let promise;

    beforeEach(() => {
      kuzzle.jwt = validJwt;

      sinon.stub(kuzzle, 'tryReAuthenticate').resolves(true);
      sinon.stub(kuzzle, 'disconnect');

      reconnectedSpy = sinon.stub();
      kuzzle.on('reconnected', reconnectedSpy);
    });

    it('should try to re-authenticate when reconnecting if a JWT was set', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });
      await kuzzle.connect();

      protocol.emit('reconnect');

      // We need a timeout since the listener on "reconnect" even is async
      setTimeout(() => {
        should(kuzzle.tryReAuthenticate).be.calledOnce();
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

    it('should not try to authenticate if the SDK was not authenticated', async () => {
      promise = new Promise(_resolve => {
        resolve = _resolve;
      });
      await kuzzle.connect();
      kuzzle.jwt = null;

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

    it('should emit "reconnectionError" if the token is not valid and no "authenticator" is set', async () => {
      kuzzle.authenticator = null;

      const ret = await kuzzle.tryReAuthenticate();

      should(ret).be.false();
      should(reconnectionErrorSpy).be.called();
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
      kuzzle.authenticator = async () => {
        kuzzle.jwt = validJwt;
      };

      sinon.spy(kuzzle, 'authenticator');
    });

    it('should execute the "authenticator"', async () => {
      const token = await kuzzle.authenticate();

      should(kuzzle.authenticator).be.calledOnce();
      should(token).be.eql(validJwt);
    });

    it('should throw an error if the "authenticator" is not set', () => {
      kuzzle.authenticator = null;

      should(kuzzle.authenticate()).be.rejected();
    });

    it('should throw an error if the "authenticator" does not set the JWT', () => {
      kuzzle.authenticator = async () => {};

      should(kuzzle.authenticate()).be.rejected();
    });
  });
});