const _kuzzle = Symbol();

class BaseController {

  /**
   * @param {string} name - Controller full name for API request.
   * @param {string} accessor - Controller accessor name on Kuzzle object.
   */
  constructor (name, accessor) {
    this.name = name;
    this.accessor = accessor;
  }

  get kuzzle () {
    return this[_kuzzle];
  }

  set kuzzle (kuzzle) {
    this[_kuzzle] = kuzzle;
  }

  /**
   * @param {object} request
   * @param {object} [options] - Optional arguments
   * @returns {Promise<object>}
  */
  query (request = {}, options = {}) {
    request.controller = request.controller || this.name;

    return this.kuzzle.query(request, options);
  }
}

module.exports = BaseController;
