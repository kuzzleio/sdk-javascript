const _kuzzle = Symbol();

class IndexController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this[_kuzzle] = kuzzle;
  }

  get kuzzle () {
    return this[_kuzzle];
  }

  create (index, options) {
    if (!index) {
      throw new Error('Kuzzle.index.create: index is required');
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'create'
    }, options);
  }

  delete (index, options) {
    if (!index) {
      throw new Error('Kuzzle.index.delete: index is required');
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'delete'
    }, options);
  }

  exists (index, options) {
    if (!index) {
      throw new Error('Kuzzle.index.exists: index is required');
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action : 'exists'
    }, options);
  }

  getAutoRefresh (index, options) {
    if (!index) {
      throw new Error('Kuzzle.index.getAutoRefresh: index is required');
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action: 'getAutoRefresh'
    }, options);
  }

  list (options) {
    return this.kuzzle.query({
      controller: 'index',
      action: 'list'
    }, options);
  }

  mDelete (indexes, options) {
    if (!Array.isArray(indexes)) {
      throw new Error('Kuzzle.index.mDelete: indexes must be an array');
    }

    return this.kuzzle.query({
      controller: 'index',
      action: 'mDelete',
      body: {
        indexes
      }
    }, options);
  }

  refresh (index, options) {
    if (!index || index === '') {
      throw new Error('Kuzzle.index.refresh: index is required');
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action: 'refresh'
    }, options);
  }

  refreshInternal (options) {
    return this.kuzzle.query({
      controller: 'index',
      action: 'refreshInternal'
    }, options);
  }

  setAutoRefresh (index, autoRefresh, options) {
    if (!index || index === '') {
      throw new Error('Kuzzle.index.setAutoRefresh: index is required');
    }

    if (typeof autoRefresh !== 'boolean') {
      throw new Error('Kuzzle.index.setAutoRefresh: autoRefresh must be a boolean');
    }

    return this.kuzzle.query({
      index,
      controller: 'index',
      action: 'setAutoRefresh',
      body: {
        autoRefresh
      }
    }, options);
  }
}

module.exports = IndexController;
