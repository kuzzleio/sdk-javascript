const BaseController = require('./Base');
const SpecificationsSearchResult = require('../core/searchResult/Specifications');

class CollectionController extends BaseController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'collection');
  }

  create (index, collection, mappings = {}, options = {}) {
    const request = {
      index,
      collection,
      body: mappings,
      action: 'create'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  deleteSpecifications (index, collection, options = {}) {
    const request = {
      index,
      collection,
      action: 'deleteSpecifications'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  exists (index, collection, options = {}) {
    return this.query({
      index,
      collection,
      action: 'exists'
    }, options)
      .then(response => response.result);
  }

  refresh (index, collection, options = {}) {
    return this.query({
      index,
      collection,
      action: 'refresh'
    }, options)
      .then(response => response.result);
  }

  getMapping (index, collection, options = {}) {
    const request = {
      index,
      collection,
      action: 'getMapping',
      includeKuzzleMeta: options.includeKuzzleMeta || false
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  getSpecifications (index, collection, options = {}) {
    return this.query({
      index,
      collection,
      action: 'getSpecifications'
    }, options)
      .then(response => response.result);
  }

  list (index, options = {}) {
    const request = {
      index,
      action: 'list',
      size: options.size || 0,
      from: options.from
    };

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
    }

    return this.query(request, options)
      .then(response => new SpecificationsSearchResult(this.kuzzle, request, options, response.result));
  }

  truncate (index, collection, options = {}) {
    const request = {
      index,
      collection,
      action: 'truncate'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  update(index, collection, body) {
    return this.query({
      index,
      collection,
      body,
      action: 'update'
    })
      .then(response => response.result);
  }

  // @deprecated
  updateMapping (index, collection, body, options = {}) {
    return this.query({
      index,
      collection,
      body,
      action: 'updateMapping'
    }, options)
      .then(response => response.result);
  }

  updateSpecifications (index, collection, specifications, options = {}) {
    return this.query({
      index,
      collection,
      body: specifications,
      action: 'updateSpecifications'
    }, options)
      .then(response => response.result);
  }

  validateSpecifications (index, collection, specifications, options = {}) {
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
