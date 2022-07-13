"use strict";

// atob is not available in React Native
// https://stackoverflow.com/questions/42829838/react-native-atob-btoa-not-working-without-remote-js-debugging

const base64Charset =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const decodeBase64 = (input) => {
  const str = input.replace(/=+$/, "");
  let output = "";

  if (str.length % 4 === 1) {
    throw new Error("Malformed base64 string.");
  }

  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++)); // eslint-disable-line no-cond-assign
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = base64Charset.indexOf(buffer);
  }

  return output;
};

class Jwt {
  constructor(encodedJwt) {
    this._encodedJwt = encodedJwt;

    this._userId = null;
    this._expiresAt = null;

    this._decode();
  }

  get encodedJwt() {
    return this._encodedJwt;
  }

  get userId() {
    return this._userId;
  }

  get expiresAt() {
    return this._expiresAt;
  }

  get expired() {
    return Math.round(Date.now() / 1000) > this.expiresAt;
  }

  _decode() {
    const payloadRaw = this._encodedJwt.split(".")[1];

    if (!payloadRaw) {
      throw new Error("Invalid JWT format");
    }

    let payload;
    try {
      payload = JSON.parse(decodeBase64(payloadRaw));
    } catch (error) {
      throw new Error("Invalid JSON payload for JWT");
    }

    this._userId = payload._id;
    this._expiresAt = payload.exp;
  }
}

module.exports = { Jwt };
