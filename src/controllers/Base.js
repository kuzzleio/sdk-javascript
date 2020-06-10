class BaseController {

  /**
   * @param {Kuzzle} kuzzle - Kuzzle SDK object.
   * @param {string} name - Controller full name for API request.
   */
  constructor (kuzzle, name) {
    Reflect.defineProperty(this, '_kuzzle', {
      value: kuzzle
    });

    this._name = name;
  }

  get kuzzle () {
    return this._kuzzle;
  }

  get name () {
    return this._name;
  }

  /**
   * @param {object} request
   * @param {object} [options] - Optional arguments
   * @returns {Promise<object>}
  */
  query (request = {}, options = {}) {
    request.controller = request.controller || this.name;

    return this._kuzzle.query(request, options);
  }
}

module.exports = BaseController;
