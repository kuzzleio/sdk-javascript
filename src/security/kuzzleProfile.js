var
  q = require('q'),
  KuzzlRole = require('./kuzzleRole'),
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

function KuzzleProfile(kuzzle, id, content) {

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

KuzzleProfile.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleProfile
  }
});

/**
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 *
 * @returns {Object} this
 */
KuzzleProfile.prototype.save = function (options, cb) {
  var
    data = this.toJSON(),
    self = this;

  self.kuzzle.callbackRequired('KuzzleProfile.save', cb);

  self.kuzzle.query(self.kuzzleSecurity.buildQueryArgs('createOrReplaceProfile'), data, null, function (error) {
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
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleProfile.prototype.hydrate = function (cb) {

  var
    self = this,
    data = {ids: self.content.roles};

  self.kuzzle.callbackRequired('KuzzleProfile.hydrate', cb);

  self.kuzzle.query(self.kuzzleSecurity.buildQueryArgs('mGetRoles'), data, null, function (error, response) {
    if (error) {
      return cb(error);
    }

    self.content.roles = response.result.hits.map(function(role) {
      return new KuzzlRole(self.kuzzleSecurity, role._id, role._source);
    });

    cb(null, self);
  });
};

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this securityDocument
 */
KuzzleSecurityDocument.prototype.toJSON = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  data.body.roles = data.body.roles.map(function(role) {
    return role.id;
  });

  return data;
};


module.exports = KuzzleProfile;
