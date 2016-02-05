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
 * Saves this user into Kuzzle.
 *
 * If this is a new user, this function will create it in Kuzzle.
 * Otherwise, this method will replace the latest version of this user in Kuzzle by the current content
 * of this object.
 *
 * @param {responseCallback} [cb] - Handles the query response
 *
 * @returns {*} this
 */
KuzzleUser.prototype.save = function (cb) {
  var
    data = this.toJSON(),
    self = this;


  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('createOrReplaceUser'), data, null, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this User
 */
KuzzleUser.prototype.toJSON = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  if (data.body.profile && data.body.profile._id) {
    data.body.profile = data.body.profile._id;
  }

  return data;
};

module.exports = KuzzleUser;
