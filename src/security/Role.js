var SecurityDocument = require('./SecurityDocument');

function Role(Security, id, content, meta) {

  SecurityDocument.call(this, Security, id, content, meta);

  // Define properties
  Object.defineProperties(this, {
    // private properties
    deleteActionName: {
      value: 'deleteRole'
    },
    updateActionName: {
      value: 'updateRole'
    }
  });

  // promisifying
  if (Security.kuzzle.bluebird) {
    return Security.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

Role.prototype = Object.create(SecurityDocument.prototype, {
  constructor: {
    value: Role
  }
});

/**
 * Saves this role into Kuzzle.
 *
 * If this is a new role, this function will create it in Kuzzle.
 * Otherwise, this method will replace the latest version of this role in Kuzzle by the current content
 * of this object.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Role} this object
 */
Role.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.Security.buildQueryArgs('createOrReplaceRole'), data, options, cb && function (error) {
    cb(error, error ? undefined : self);
  });

  return this;
};

module.exports = Role;
