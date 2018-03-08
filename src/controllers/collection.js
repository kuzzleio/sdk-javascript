const
  SpecificationsSearchResult = require('./searchResult/specifications');

class CollectionController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this.kuzzle = kuzzle;
  }

  create (index, collection, options) {
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
    }, undefined, options);
  }

  deleteSpecification (index, collection, options) {
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
    }, undefined, options);
  }

  exists (index, collection, options) {
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
    }, undefined, options);
  }

  getMapping (index, collection, options) {
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
    }, undefined, options);
  }

  getSpecifications (index, collection, options) {
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
    }, undefined, options);
  }

  list (index, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.list: index is required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'collection',
      action: 'list'
    }, undefined, options);
  }

  searchSpecifications (query = {}, options) {
    return this.kuzzle.query({
      controller: 'collection',
      action: 'searchSpecifications'
    }, query, options)
      .then(response => new SpecificationsSearchResult(this.kuzzle, query, options, response));
  }

  truncate (index, collection, options) {
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
    }, undefined, options);
  }

  updateMapping (index, collection, body, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.updateMapping: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.updateMapping: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'updateMapping'
    }, {body}, options);
  }

  updateSpecifications (index, collection, body, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.updateSpecifications: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.collection.updateSpecifications: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'updateSpecifications'
    }, {body}, options);
  }

  validateSpecifications (body, options) {
    return this.kuzzle.query({
      controller: 'collection',
      action: 'validateSpecifications'
    }, {body}, options);
  }
}

module.exports = CollectionController;
