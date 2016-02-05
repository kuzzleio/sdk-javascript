var
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument'),
  KuzzleRole = require('./kuzzleRole');

function KuzzleProfile(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // Hydrate profile with roles if roles are not only string but objects with `_id` and `_source`
  if (content && content.roles) {
    content.roles = content.roles.map(function (role) {
      if (!role._id || !role._source) {
        return role;
      }

      return new KuzzleRole(kuzzleSecurity, role._id, role._source);
    })
  }

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['hydrate', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

KuzzleProfile.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleProfile
  }
});

/**
 *
 */
KuzzleProfile.prototype.hydrate = function () {

};

/**
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 *
 * @returns {Object} this
 */
KuzzleProfile.prototype.save = function (options, cb) {

};

module.exports = KuzzleProfile;
