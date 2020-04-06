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
    return this.query({
      index,
      collection,
      action: 'getMapping'
    }, options)
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
    const request = {
      index,
      collection,
      action: 'truncate'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

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
