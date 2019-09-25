const BaseController = require('./base');

class IndexController extends BaseController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'index');
  }

  create (index, options) {
    if (!index) {
      throw new Error('Kuzzle.index.create: index is required');
    }

    return this.query({
      index,
      action : 'create'
    }, options)
      .then(response => response.result);
  }

  delete (index, options) {
    if (!index) {
      throw new Error('Kuzzle.index.delete: index is required');
    }

    return this.query({
      index,
      action : 'delete'
    }, options)
      .then(response => response.result.acknowledged);
  }

  exists (index, options) {
    if (!index) {
      throw new Error('Kuzzle.index.exists: index is required');
    }

    return this.query({
      index,
      action : 'exists'
    }, options)
      .then(response => response.result);
  }

  list (options) {
    return this.query({
      action: 'list'
    }, options)
      .then(response => response.result.indexes);
  }

  mDelete (indexes, options) {
    if (!Array.isArray(indexes)) {
      throw new Error('Kuzzle.index.mDelete: indexes must be an array');
    }

    return this.query({
      action: 'mDelete',
      body: {
        indexes
      }
    }, options)
      .then(response => response.result.deleted);
  }
}

module.exports = IndexController;
