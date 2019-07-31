'use strict';

class PendingRequest {
  constructor(request) {
    this._resolve = null;
    this._reject = null;
    this.request = request;
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(...payload) {
    this._resolve(...payload);
  }

  reject(error) {
    this._reject(error);
  }
}

module.exports = PendingRequest;
