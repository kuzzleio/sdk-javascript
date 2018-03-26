const
  SpecificationsSearchResult = require('./searchResult/specifications');

const _kuzzle = Symbol();

class CollectionController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this[_kuzzle] = kuzzle;
  }

  get kuzzle () {
    return [_kuzzle];
  }

  create (index, collection, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.create: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.create: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'create'
    }, options);
  }

  deleteSpecification (index, collection, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.deleteSpecification: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.deleteSpecification: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'deleteSpecification'
    }, options);
  }

  exists (index, collection, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.exists: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.exists: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'exists'
    }, options);
  }

  getMapping (index, collection, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.getMapping: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.getMapping: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'getMapping'
    }, options);
  }

  getSpecifications (index, collection, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.getSpecifications: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.getSpecifications: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'getSpecifications'
    }, options);
  }

  list (index, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.list: index is required'));
    }

    const request = {
      index,
      controller: 'collection',
      action: 'list',
      from: options.from,
      size: options.size
    };
    delete options.from;
    delete topions.size;

    return this.kuzzle.query(request, options);
  }

  searchSpecifications (body = {}, options = {}) {
    const request = {
      body,
      controller: 'collection',
      action: 'searchSpecifications'
    };
    for (const opt of ['from', 'size', 'scroll']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.kuzzle.query(request, options)
      .then(response => new SpecificationsSearchResult(this.kuzzle, query, options, response));
  }

  truncate (index, collection, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.truncate: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.truncate: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'colleciton',
      action: 'truncate'
    }, options);
  }

  updateMapping (index, collection, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.updateMapping: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.updateMapping: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      body,
      controller: 'collection',
      action: 'updateMapping'
    }, options);
  }

  updateSpecifications (index, collection, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.updateSpecifications: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.updateSpecifications: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      body,
      controller: 'collection',
      action: 'updateSpecifications'
    }, options);
  }

  validateSpecifications (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'collection',
      action: 'validateSpecifications'
    }, options);
  }
}

module.exports = CollectionController;
