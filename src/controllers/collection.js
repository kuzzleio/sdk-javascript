const
  BaseController = require('./base'),
  SpecificationsSearchResult = require('./searchResult/specifications');

class CollectionController extends BaseController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'collection');
  }

  create (index, collection, body = {}, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.create: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.create: collection is required');
    }

    return this.query({
      index,
      collection,
      body,
      action: 'create'
    }, options)
      .then(response => response.result);
  }

  deleteSpecifications (index, collection, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.deleteSpecifications: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.deleteSpecifications: collection is required');
    }

    return this.query({
      index,
      collection,
      action: 'deleteSpecifications'
    }, options)
      .then(response => response.result);
  }

  exists (index, collection, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.exists: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.exists: collection is required');
    }

    return this.query({
      index,
      collection,
      action: 'exists'
    }, options)
      .then(response => response.result);
  }

  refresh (index, collection, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.refresh: index is required');
    }

    if (!collection) {
      throw new Error('Kuzzle.collection.refresh: collection is required');
    }

    return this.query({
      index,
      collection,
      action: 'refresh'
    }, options)
      .then(response => response.result);
  }

  getMapping (index, collection, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.getMapping: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.getMapping: collection is required');
    }

    return this.query({
      index,
      collection,
      action: 'getMapping'
    }, options)
      .then(response => response.result);
  }

  getSpecifications (index, collection, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.getSpecifications: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.getSpecifications: collection is required');
    }

    return this.query({
      index,
      collection,
      action: 'getSpecifications'
    }, options)
      .then(response => response.result);
  }

  list (index, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.list: index is required');
    }

    const request = {
      index,
      action: 'list',
      from: options.from,
      size: options.size
    };
    delete options.from;
    delete options.size;

    return this.query(request, options)
      .then(response => response.result);
  }

  searchSpecifications (body = {}, options = {}) {
    const request = {
      body,
      action: 'searchSpecifications'
    };
    for (const opt of ['from', 'size', 'scroll']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.query(request, options)
      .then(response => new SpecificationsSearchResult(this.kuzzle, request, options, response.result));
  }

  truncate (index, collection, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.truncate: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.truncate: collection is required');
    }

    return this.query({
      index,
      collection,
      action: 'truncate',
      refresh: options.refresh
    }, options)
      .then(response => response.result);
  }

  updateMapping (index, collection, body, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.updateMapping: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.updateMapping: collection is required');
    }

    return this.query({
      index,
      collection,
      body,
      action: 'updateMapping'
    }, options)
      .then(response => response.result);
  }

  updateSpecifications (index, collection, specifications, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.updateSpecifications: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.updateSpecifications: collection is required');
    }
    if (!specifications) {
      throw new Error('Kuzzle.collection.updateSpecifications: specifications are required');
    }

    return this.query({
      index,
      collection,
      body: specifications,
      action: 'updateSpecifications'
    }, options)
      .then(response => response.result);
  }

  validateSpecifications (index, collection, specifications, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.validateSpecifications: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.validateSpecifications: collection is required');
    }
    if (!specifications) {
      throw new Error('Kuzzle.collection.updateSpecifications: specifications are required');
    }

    return this.query({
      index,
      collection,
      body: specifications,
      action: 'validateSpecifications'
    }, options)
      .then(response => response.result);
  }
}

module.exports = CollectionController;
