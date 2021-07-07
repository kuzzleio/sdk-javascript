const
  generateJwt = require('../mocks/generateJwt.mock'),
  rewire = require('rewire'),
  should = require('should');

describe('Jwt', () => {
  let
    Jwt,
    authenticationToken;

  beforeEach(() => {
    ({ Jwt } = rewire('../../src/core/Jwt'));
  });

  describe('#constructor', () => {
    it('should construct a Jwt instance and decode the payload', () => {
      const
        expiresAt = Math.round(Date.now() / 1000) + 3600 * 1000,
        encodedJwt = generateJwt('user-gordon', expiresAt);

      authenticationToken = new Jwt(encodedJwt);

      should(authenticationToken.encodedJwt).be.eql(encodedJwt);
      should(authenticationToken.userId).be.eql('user-gordon');
      should(authenticationToken.expiresAt).be.eql(expiresAt);
      should(authenticationToken.expired).be.eql(false);
    });

    it('should throw with an invalid JWT format', () => {
      should(() => {
        new Jwt('this-is-invalid');
      }).throwError('Invalid JWT format');
    });

    it('should throw with an invalid JSON payload', () => {
      should(() => {
        new Jwt('this-is.not-json-payload.for-sure');
      }).throwError('Invalid JSON payload for JWT');
    });
  });

  describe('#get expired', () => {
    it('should return a boolean according to expiresAt', () => {
      const encodedJwt = generateJwt('user-gordon', Math.round(Date.now() / 1000) - 1000);

      authenticationToken = new Jwt(encodedJwt);

      should(authenticationToken.expired).be.eql(true);
    });
  });
});
