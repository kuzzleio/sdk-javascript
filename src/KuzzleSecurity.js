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
 *
 * @param {string} name
 * @param {bool} [hydrate]
 */
KuzzleSecurity.prototype.fetchRole = function (name, hydrate) {

};
/**
 *
 * @param {object} filters
 * @param {bool} [hydrate]
 */
KuzzleSecurity.prototype.searchRole = function (filters, hydrate) {

};

/**
 * 
 * @param {object} role
 */
KuzzleSecurity.prototype.createRole = function (role) {

};