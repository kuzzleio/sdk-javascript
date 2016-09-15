/**
 * Sugar-code handling the result of a KuzzleRoom.renew call
 * @constructor
 */
function KuzzleSubscribeResult() {
  this.cbs = [];
}

/**
 * Registers a callback to be called with a subscription result
 * @param {Function} cb
 */
KuzzleSubscribeResult.prototype.onDone = function (cb) {
  this.cbs.push(cb);
  return this;
};

/**
 * Calls all registered callbacks
 *
 * @param {Object} error object
 * @param {KuzzleRoom} room
 */
KuzzleSubscribeResult.prototype.done = function (error, room) {
  this.cbs.forEach(function (cb) {
    cb(error, room);
  });
};

module.exports = KuzzleSubscribeResult;
