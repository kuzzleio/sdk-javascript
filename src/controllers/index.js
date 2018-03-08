class IndexController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this.kuzzle = kuzzle;
  }

  create (index, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.index.create: index required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'create'
    }, undefined, options);
  }

  delete (index, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.index.delete: index required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'delete'
    }, undefined, options);
  }

  exists (index, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.index.exists: index required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'exists'
    }, undefined, options);
  }

  getAutoRefresh (index, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.index.getAutoRefresh: index is required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action: 'getAutoRefresh'
    }, undefined, options);
  }

  list (options) {
    return this.kuzzle.query({
      controller: 'index',
      action: 'list'
    }, undefined, options);
  }

  mDelete (indexes, options) {
    if (!Array.isArray(indexes)) {
      return Promise.reject(new Error('Kuzzle.index.mDelete: indexes must be an array'));
    }

    return this.kuzzle.query({
      controller: 'index',
      action: 'mDelete'
    }, {
      body: {
        indexes
      }
    }, undefined, options);
  }

  refresh (index, options) {
    if (!index || index === '') {
      return Promise.reject(new Error('Kuzzle.index.refresh: index is required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action: 'refresh'
    }, undefined, options);
  }

  refreshInternal (options) {
    return this.kuzzle.query({
      controller: 'index',
      action: 'refreshInternal'
    }, undefined, options);
  }

  setAutoRefresh (index, autoRefresh, options) {
    if (autoRefresh === undefined && typeof index === 'boolean') {
      autoRefresh = index;
      index = this.kuzzle.defaultIndex;
    }

    if (!index || index === '') {
      return Promise.reject(new Error('Kuzzle.index.setAutoRefresh: index is required'));
    }

    if (typeof autoRefresh !== 'boolean') {
      return Promise.reject(new Error('Kuzzle.index.setAutoRefresh: autoRefresh must be a boolean'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action: 'setAutoRefresh'
    }, {
      body: {
        autoRefresh
      }
    }, undefined, options);
  }
}

module.exports = IndexController;
