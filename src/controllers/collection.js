const
  SpecificationsSearchResult = require('./searchResult/specifications');

class CollectionController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this.kuzzle = kuzzle;
  }

  create (index, collection) {
    if (collection === undefined && typeof index === 'string') {
      collection = index;
      index = this.kuzzle.defaultIndex;
    }

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
    });
  }

  deleteSpecification (index, collection) {
    if (collection === undefined && typeof index === 'string') {
      collection = index;
      index = this.kuzzle.defaultIndex;
    }

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
    });
  }

  exists (index, collection) {
    if (collection === undefined && typeof index === 'string') {
      collection = index;
      index = this.kuzzle.defaultIndex;
    }

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
    });
  }

  getMapping (index, collection) {
    if (collection === undefined && typeof index === 'string') {
      collection = index;
      index = this.kuzzle.defaultIndex;
    }

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
    });
  }

  getSpecifications (index, collection) {
    if (collection === undefined && typeof index === 'string') {
      collection = index;
      index = this.kuzzle.defaultIndex;
    }

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
    });
  }

  list (index, options = null) {
    if (options === null && typeof index === 'object') {
      options = index;
      index = this.kuzzle.defaultIndex;
    }

    if (!index) {
      return Promise.reject(new Error('Kuzzle.collection.list: index is required'));
    }

    return this.kuzzle.query({
      index,
      controller: 'collection',
      action: 'list'
    }, {}, options);
  }

  searchSpecifications (query = {}, options = {}) {
    return this.kuzzle.query({
      controller: 'collection',
      action: 'searchSpecifications'
    }, query, options)
      .then(response => new SpecificationsSearchResult(this.kuzzle, query, options, response));
  }

  truncate (index, collection) {
    if (collection === undefined && typeof index === 'string') {
      collection = index;
      index = this.kuzzle.defaultIndex;
    }

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
    });

  }

  updateMapping (index, collection, body) {
    if (collection === undefined && typeof index === 'string') {
      collection = index;
      index = this.kuzzle.defaultIndex;
    }

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
    }, body);
  }

  updateSpecifications (index, collection, body) {
    if (collection === undefined && typeof index === 'string') {
      collection = index;
      index = this.kuzzle.defaultIndex;
    }

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
    }, body);
  }

  validateSpecifications (body) {
    return this.kuzzle.query({
      controller: 'collection',
      action: 'validateSpecifications'
    }, body);
  }
}

module.exports = CollectionController;
