'use strict';

// used for unit tests
const browserAtob = base64 => atob(base64);
const bufferAvailable = () => typeof Buffer !== 'undefined';

const decodeBase64 = base64 => {
  if (bufferAvailable()) {
    return Buffer.from(base64, 'base64').toString();
  }

  return browserAtob(base64);
};

class Jwt {
  constructor (encodedJwt) {
    this._encodedJwt = encodedJwt;

    this._userId = null;
    this._expiresAt = null;

    this._decode();
  }

  get encodedJwt () {
    return this._encodedJwt;
  }

  get userId () {
    return this._userId;
  }

  get expiresAt () {
    return this._expiresAt;
  }

  get expired () {
    return Date.now() > this.expiresAt;
  }

  _decode () {
    const payloadRaw = this._encodedJwt.split('.')[1];

    if (!payloadRaw) {
      throw new Error('Invalid JWT format');
    }

    let payload;
    try {
      payload = JSON.parse(decodeBase64(payloadRaw));
    } catch (error) {
      throw new Error('Invalid JSON payload for JWT');
    }

    this._userId = payload._id;
    this._expiresAt = payload.exp;
  }
}

module.exports = Jwt;