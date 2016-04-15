var
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle');

function ErrorCallback (F) {
  function f() {
    return F.apply(this, arguments);
  }
  f.__proto__ = ErrorCallback.prototype;
  return f;
}
ErrorCallback.prototype = Object.create(Function.prototype);

Kuzzle.prototype.ErrorCallback = ErrorCallback;

Kuzzle.prototype.query = function (args, query, options, cb) {
  var
    r = {
      args: args,
      query: query,
      options: options,
      cb: cb
    };
  this._lastQueryParams = r;

  if (typeof cb === 'function') {
    if (cb instanceof ErrorCallback) {
      return cb(r, null);
    }
    return cb(null, r);
  }
};

module.exports = Kuzzle;
