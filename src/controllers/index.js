class IndexController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this.kuzzle = kuzzle;
  }

  create (index = this.kuzzle.defaultIndex) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.index.create: index required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'create'
    });
  }

  delete (index) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.index.delete: index required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'delete'
    });
  }

  exists (index) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.index.exists: index required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'exists'
    });
  }

  getAutoRefresh (index = this.kuzzle.defaultIndex) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.index.getAutoRefresh: index is required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action: 'getAutoRefresh'
    });
  }

  list () {
    return this.kuzzle.query({
      controller: 'index',
      action: 'list'
    });
  }

  mDelete (indexes) {
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
    });
  }

  refresh (index = this.kuzzle.defaultIndex) {
    if (!index || index === '') {
      return Promise.reject(new Error('Kuzzle.index.refresh: index required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action: 'refresh'
    });

  }

  refreshInternal () {
    return this.kuzzle.query({
      controller: 'index',
      action: 'refreshInternal'
    });
  }

  setAutoRefresh (index, autoRefresh) {
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
    });
  }
}

module.exports = IndexController;
