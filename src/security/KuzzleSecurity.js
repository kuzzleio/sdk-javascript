/**
 * Kuzzle security constructor
 *
 * @param kuzzle
 * @param headers
 * @returns {KuzzleSecurity}
 * @constructor
 */
function KuzzleSecurity(kuzzle, headers) {

  if (!headers) {
    headers = kuzzle.headers;
  }

  Object.defineProperties(this, {
    kuzzle: {
      value: kuzzle,
      enumerable: true
    },
    // writable properties
    headers: {
      value: JSON.parse(JSON.stringify(headers)),
      enumerable: true,
      writable: true
    }
  });

  return this;
}


/**
 * @param {string} name
 * @returns {Object} this
 */
KuzzleSecurity.prototype.fetchRole = function (name) {

};
/**
 *
 * @param {object} filters
 */
KuzzleSecurity.prototype.searchRoles = function (filters) {

};

/**
 * 
 * @param {object} role
 */
KuzzleSecurity.prototype.createRole = function (role) {

};

/**
 * @param {string} name
 * @param {Boolean} hydrate
 * @returns {Object} this
 */
KuzzleSecurity.prototype.fetchProfile = function (name, hydrate) {

};
/**
 *
 * @param {object} filters
 * @param {Boolean} hydrate
 */
KuzzleSecurity.prototype.searchProfiles = function (filters, hydrate) {

};

/**
 *
 * @param {object} profile
 */
KuzzleSecurity.prototype.createProfile = function (profile) {

};

/**
 * @param {string} name
 * @param {Boolean} hydrate
 * @returns {Object} this
 */
KuzzleSecurity.prototype.fetchUser = function (name, hydrate) {

};
/**
 *
 * @param {object} filters
 * @param {Boolean} hydrate
 */
KuzzleSecurity.prototype.searchUsers = function (filters, hydrate) {

};

/**
 *
 * @param {object} profile
 */
KuzzleSecurity.prototype.createUser = function (profile) {

};