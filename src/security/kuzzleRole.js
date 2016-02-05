var KuzzleSecurityDocument = require('./kuzzleSecurityDocument');
var util = require('util');


function KuzzleRole(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

KuzzleRole.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleRole
  }
});

/**
 * Saves this role into Kuzzle.
 *
 * If this is a new role, this function will create it in Kuzzle.
 * Otherwise, this method will replace the latest version of this role in Kuzzle by the current content
 * of this object.
 *
 * @param {responseCallback} [cb] - Handles the query response
 *
 * @returns {*} this
 */
KuzzleRole.prototype.save = function (cb) {
  var
    data = this.toJSON(),
    self = this;


  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('createOrReplace'), data, null, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};

module.exports = KuzzleRole;