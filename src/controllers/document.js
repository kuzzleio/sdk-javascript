const
  BaseController = require('./base'),
  DocumentSearchResult = require('./searchResult/document');

class DocumentController extends BaseController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'document');
  }

  count (index, collection, body, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.count: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.count: collection is required');
    }

    const request = {
      index,
      collection,
      body,
      action: 'count',
      includeTrash: options.includeTrash
    };
    delete options.includeTrash;

    return this.query(request, options)
      .then(response => response.result.count);
  }

  create (index, collection, document, _id = null, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.create: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.create: collection is required');
    }
    if (!document) {
      throw new Error('Kuzzle.document.create: document is required');
    }

    const request = {
      index,
      collection,
      _id,
      body: document,
      action: 'create',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  createOrReplace (index, collection, _id, body, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.createOrReplace: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.createOrReplace: collection is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.document.createOrReplace: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.document.createOrReplace: body is required');
    }

    const request = {
      index,
      collection,
      _id,
      body,
      action: 'createOrReplace',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  delete (index, collection, _id, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.delete: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.delete: collection is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.document.delete: _id is required');
    }

    const request = {
      index,
      collection,
      _id,
      action: 'delete',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result._id);
  }

  deleteByQuery(index, collection, body = {}, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.deleteByQuery: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.deleteByQuery: collection is required');
    }

    const request = {
      index,
      collection,
      body,
      action: 'deleteByQuery',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result.ids);
  }

  exists (index, collection, _id, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.get: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.get: collection is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.document.get: _id is required');
    }

    const request = {
      index,
      collection,
      _id,
      action: 'exists'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  get (index, collection, _id, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.get: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.get: collection is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.document.get: _id is required');
    }

    const request = {
      index,
      collection,
      _id,
      action: 'get',
      includeTrash: options.includeTrash
    };
    delete options.includeTrash;

    return this.query(request, options)
      .then(response => response.result);
  }

  mCreate (index, collection, documents, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.mCreate: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.mCreate: collection is required');
    }
    if (!Array.isArray(documents)) {
      throw new Error('Kuzzle.document.mCreate: documents must be an array');
    }

    const request = {
      index,
      collection,
      body: {documents},
      action: 'mCreate',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  mCreateOrReplace (index, collection, documents, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.mCreateOrReplace: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.mCreateOrReplace: collection is required');
    }
    if (!Array.isArray(documents)) {
      throw new Error('Kuzzle.document.mCreateOrReplace: documents must be an array');
    }

    const request = {
      index,
      collection,
      body: {documents},
      action: 'mCreateOrReplace',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  mDelete (index, collection, ids, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.mDelete: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.mDelete: collection is required');
    }
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.document.mDelete: ids must be an array');
    }

    const request = {
      index,
      collection,
      body: {ids},
      action: 'mDelete',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => {
        console.log(JSON.stringify(response, null, 2))
        return response.result
      });
  }

  mGet (index, collection, ids, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.mGet: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.mGet: collection is required');
    }
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.document.mGet: ids must be an array');
    }

    const request = {
      index,
      collection,
      body: {ids},
      action: 'mGet',
      includeTrash: options.includeTrash
    };
    delete options.includeTrash;

    return this.query(request, options)
      .then(response => response.result);
  }

  mReplace (index, collection, documents, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.mReplace: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.mReplace: collection is required');
    }
    if (!Array.isArray(documents)) {
      throw new Error('Kuzzle.document.mReplace: documents must be an array');
    }

    const request = {
      index,
      collection,
      body: {documents},
      action: 'mReplace',
      refresh: options.refresh
    };
    delete options.refresh;
    return this.query(request, options)
      .then(response => response.result);
  }

  mUpdate (index, collection, documents, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.mUpdate: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.mUpdate: collection is required');
    }
    if (!Array.isArray(documents)) {
      throw new Error('Kuzzle.document.mUpdate: documents must be an array');
    }

    const request = {
      index,
      collection,
      body: {documents},
      action: 'mUpdate',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  replace (index, collection, _id, body, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.replace: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.replace: collection is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.document.replace: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.document.replace: body is required');
    }

    const request = {
      index,
      collection,
      _id,
      body,
      action: 'replace',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  search (index, collection, body = {}, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.search: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.search: collection is required');
    }

    const request = {
      index,
      collection,
      body,
      action: 'search',
    };

    for (const opt of ['from', 'size', 'scroll', 'includeTrash']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    request.size = request.size || 10;
    if (!request.scroll && !request.body.sort && !request.from) {
      request.from = 0;
    }

    return this.query(request, options)
      .then(response => new DocumentSearchResult(this.kuzzle, request, options, response.result));
  }

  update (index, collection, _id, body, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.update: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.update: collection is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.document.update: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.document.update: body is required');
    }

    const request = {
      index,
      collection,
      _id,
      body,
      action: 'update',
      refresh: options.refresh,
      retryOnConflict: options.retryOnConflict
    };
    delete options.refresh;
    delete options.retryOnConflict;

    return this.query(request, options)
      .then(response => response.result);
  }

  validate (index, collection, body, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.document.validate: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.document.validate: collection is required');
    }
    if (!body) {
      throw new Error('Kuzzle.document.validate: body is required');
    }

    return this.query({
      index,
      collection,
      body,
      action: 'validate'
    }, options)
      .then(response => response.result);
  }
}

module.exports = DocumentController;
