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
    return this[_kuzzle];
  }

  create (index, collection, body = {}, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.create: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.create: collection is required');
    }

    return this.kuzzle.query({
      index,
      collection,
      body,
      controller: 'collection',
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

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
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

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'exists'
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

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
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

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
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
      controller: 'collection',
      action: 'list',
      from: options.from,
      size: options.size
    };
    delete options.from;
    delete options.size;

    return this.kuzzle.query(request, options)
      .then(response => response.result);
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
      .then(response => new SpecificationsSearchResult(this.kuzzle, request, options, response.result));
  }

  truncate (index, collection, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.collection.truncate: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.collection.truncate: collection is required');
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'collection',
      action: 'truncate'
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

    return this.kuzzle.query({
      index,
      collection,
      body,
      controller: 'collection',
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

    const body = {
      [index]: {
        [collection]: specifications
      }
    };

    return this.kuzzle.query({
      body,
      controller: 'collection',
      action: 'updateSpecifications'
    }, options)
      .then(response => response.result[index][collection]);
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

    const body = {
      [index]: {
        [collection]: specifications
      }
    };

    return this.kuzzle.query({
      body,
      controller: 'collection',
      action: 'validateSpecifications'
    }, options)
      .then(response => response.result);
  }
}

module.exports = CollectionController;
