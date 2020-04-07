class AbortablePromise {
  constructor (originalPromise) {
    this._originalPromise = originalPromise;

    this._resolve = null;
    this._reject = null;

    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    // no
    this._promise.then(originalPromise.resolve);
    this._promise.catch(originalPromise.reject);
  }

  reject (arg) {
    this._reject(arg);
  }

  resolve (arg) {
    this._resolve(arg);
  }
}

module.exports = AbortablePromise;