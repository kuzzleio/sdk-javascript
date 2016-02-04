var KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

function KuzzleUser(kuzzle, id, content) {

  KuzzleSecurityDocument.call(this, kuzzle, id, content);

  // promisifying
  if (kuzzle.bluebird) {
    return kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['hydrate', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

KuzzleUser.prototype = Object.create(KuzzleUser.prototype, {
  constructor: {
    value: KuzzleUser
  }
});

/**
 *
 */
KuzzleUser.prototype.hydrate = function () {

};

/**
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 *
 * @returns {Object} this
 */
KuzzleUser.prototype.save = function (options, cb) {

};

module.exports = KuzzleUser;
