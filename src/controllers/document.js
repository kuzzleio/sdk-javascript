const
  DocumentSearchResult = require('./searchResult/document');

class DocumentController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this.kuzzle = kuzzle;
  }

  count (index, collection, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.count: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.count: collection is required'));
    }

    const request = {
      index,
      collection,
      body,
      controller: 'document',
      action: 'count',
      includeTrash: options.includeTrash
    };
    delete options.includeTrash;

    return this.kuzzle.query(request, options)
      .then(response => response.count);
  }

  create (index, collection, _id, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.create: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.create: collection is required'));
    }

    const request = {
      index,
      collection,
      _id,
      body,
      controller: 'document',
      action: 'create',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  createOrReplace (index, collection, _id, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.createOrReplace: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.createOrReplace: collection is required'));
    }
    if (!_id) {
      return Promise.reject(new Error('Kuzzle.document.createOrReplace: _id is required'));
    }
    if (!body) {
      return Promise.reject(new Error('Kuzzle.document.createOrReplace: body is required'));
    }

    const request = {
      index,
      collection,
      _id,
      body,
      controller: 'document',
      action: 'createOrReplace',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  delete (index, collection, _id, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.delete: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.delete: collection is required'));
    }
    if (!_id) {
      return Promise.reject(new Error('Kuzzle.document.delete: _id is required'));
    }

    const request = {
      index,
      collection,
      _id,
      body,
      controller: 'document',
      action: 'delete',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  deleteByQuery(index, collection, body = {}, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.deleteByQuery: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.deleteByQuery: collection is required'));
    }

    const request = {
      index,
      collection,
      body,
      controller: 'document',
      action: 'deleteByQuery',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  get (index, collection, _id, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.get: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.get: collection is required'));
    }

    const request = {
      index,
      collection,
      _id,
      controller: 'document',
      action: 'get',
      includeTrash: options.includeTrash
    };
    delete options.includeTrash;

    return this.kuzzle.query(request, options);
  }

  mCreate (index, collection, documents, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mCreate: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mCreate: collection is required'));
    }
    if (!Array.isArray(documents)) {
      return Promise.reject(new Error('Kuzzle.document.mCreate: documents must be an array'));
    }

    const request = {
      index,
      collection,
      body: {documents},
      controller: 'document',
      action: 'mCreate',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  mCreateOrReplace (index, collection, documents, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mCreateOrReplace: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mCreateOrReplace: collection is required'));
    }
    if (!Array.isArray(documents)) {
      return Promise.reject(new Error('Kuzzle.document.mCreateOrReplace: documents must be an array'));
    }

    const request = {
      index,
      collection,
      body: {documents},
      controller: 'document',
      action: 'mCreateOrReplace',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  mDelete (index, collection, ids, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mDelete: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mDelete: collection is required'));
    }
    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('Kuzzle.document.mDelete: ids must be an array'));
    }

    const request = {
      index,
      collection,
      body: {ids},
      controller: 'document',
      action: 'mDelete',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  mGet (index, collection, ids, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mGet: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mGet: collection is required'));
    }
    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('Kuzzle.document.mGet: ids must be an array'));
    }

    const request = {
      index,
      collection,
      body: {ids},
      controller: 'document',
      action: 'mGet',
      includeTrash: options.includeTrash
    };
    delete options.includeTrash;

    return this.kuzzle.query(request, options);
  }

  mReplace (index, collection, documents, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mReplace: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mReplace: collection is required'));
    }
    if (!Array.isArray(documents)) {
      return Promise.reject(new Error('Kuzzle.document.mReplace: documents must be an array'));
    }

    const request = {
      index,
      collection,
      body: {documents},
      controller: 'document',
      action: 'mReplace',
      refresh: options.refresh
    };
    delete options.refresh;
    return this.kuzzle.query(request, options);
  }

  mUpdate (index, collection, documents, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mUpdate: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mUpdate: collection is required'));
    }
    if (!Array.isArray(documents)) {
      return Promise.reject(new Error('Kuzzle.document.mUpdate: documents must be an array'));
    }

    const request = {
      index,
      collection,
      body: {documents},
      controller: 'document',
      action: 'mUpdate',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  replace (index, collection, _id, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.replace: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.replace: collection is required'));
    }
    if (!_id) {
      return Promise.reject(new Error('Kuzzle.document.replace: _id is required'));
    }
    if (!body) {
      return Promise.reject(new Error('Kuzzle.document.replace: body is required'));
    }

    const request = {
      index,
      collection,
      _id,
      body,
      controller: 'document',
      action: 'replace',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  search (index, collection, body = {}, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.search: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.search: collection is required'));
    }

    const request = {
      index,
      collection,
      body,
      controller: 'document',
      action: 'search',
    };
    for (const opt of ['from', 'size', 'scroll', 'sort', 'includeTrash']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.kuzzle.query(request, options)
      .then(response => new DocumentSearchResult(this.kuzzle, request, options, response));
  }

  update (index, collection, _id, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.update: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.update: collection is required'));
    }
    if (!_id) {
      return Promise.reject(new Error('Kuzzle.document.update: _id is required'));
    }
    if (!body) {
      return Promise.reject(new Error('Kuzzle.document.update: body is required'));
    }

    const request = {
      index,
      collection,
      _id,
      body,
      controller: 'document',
      action: 'update',
      refresh: options.refresh,
      retryOnConflict: options.retryOnConflict
    };
    delete options.refresh;
    delete options.retryOnConflict;

    return this.kuzzle.query(request, options);
  }

  validate (index, collection, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.validate: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.validate: collection is required'));
    }
    if (!body) {
      return Promise.reject(new Error('Kuzzle.document.validate: body is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      body,
      controller: 'document',
      action: 'validate'
    }, options);
  }
}

module.exports = DocumentController;
