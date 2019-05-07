'use strict';

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
    const 
      [, payloadRaw, ] = this._encodedJwt.split('.'),
      payload = JSON.parse(new Buffer(payloadRaw, 'base64').toString());
    
    this._userId = payload._id;
    this._expiresAt = payload.exp;
  }
}

module.exports = Jwt;