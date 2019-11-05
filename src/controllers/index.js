const BaseController = require('./base');

class IndexController extends BaseController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'index');
  }

  create (index, options) {
    return this.query({
      index,
      action : 'create'
    }, options)
      .then(response => response.result);
  }

  delete (index, options) {
    return this.query({
      index,
      action : 'delete'
    }, options)
      .then(response => response.result.acknowledged);
  }

  exists (index, options) {
    return this.query({
      index,
      action : 'exists'
    }, options)
      .then(response => response.result);
  }

  getAutoRefresh (index, options) {
    return this.query({
      index,
      action: 'getAutoRefresh'
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
    return this.query({
      action: 'mDelete',
      body: {
        indexes
      }
    }, options)
      .then(response => response.result.deleted);
  }

  refresh (index, options) {
    return this.query({
      index,
      action: 'refresh'
    }, options)
      .then(response => response.result._shards);
  }

  refreshInternal (options) {
    return this.query({
      action: 'refreshInternal'
    }, options)
      .then(response => response.result.acknowledged);
  }

  setAutoRefresh (index, autoRefresh, options) {
    return this.query({
      index,
      action: 'setAutoRefresh',
      body: {
        autoRefresh
      }
    }, options)
      .then(response => response.result.response);
  }
}

module.exports = IndexController;
