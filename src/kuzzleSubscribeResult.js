/**
 * Sugar-code handling the result of a KuzzleRoom.renew call
 * @constructor
 */
function KuzzleSubscribeResult() {
  this.onSuccessCB = [];
  this.onErrorCB = [];
}

/**
 * Registers a callback to be called on a successful subscription
 * @param {Function} cb
 */
KuzzleSubscribeResult.prototype.onSuccess = function (cb) {
  this.onSuccessCB.push(cb);
};

/**
 * Registers a callback to be called on a failed subscription
 * @param {Function} cb
 */
KuzzleSubscribeResult.prototype.onError = function (cb) {
  this.onErrorCB.push(cb);
};

/**
 * Calls all onSuccess callbacks
 * @param {KuzzleRoom} room
 */
KuzzleSubscribeResult.prototype.success = function (room) {
  this.onSuccessCB.forEach(function (cb) {
    cb(room);
  });
};

/**
 * Calls all onError callbacks
 * @param {Error} err
 */
KuzzleSubscribeResult.prototype.error = function (err) {
  this.onErrorCB.forEach(function (cb) {
    cb(err);
  });
};

module.exports = KuzzleSubscribeResult;
