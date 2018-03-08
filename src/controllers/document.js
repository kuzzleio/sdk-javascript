const
  DocumentSearchResult = require('./searchResult/document');

class DocumentController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this.kuzzle = kuzzle;
  }

  count (index, collection, body, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.count: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.count: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'count'
    }, body, options);
  }

  create (index, collection, _id, body, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.create: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.create: collection is required'));
    }

    const req = this._buildRequest(body, options);
    if (_id) {
      req._id = _id;
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'create'
    }, req, options);
  }

  createOrReplace (index, collection, _id, body, options) {
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

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'createOrReplace'
    }, {_id, body}, options);
  }

  delete (index, collection, _id, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.delete: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.delete: collection is required'));
    }
    if (!_id) {
      return Promise.reject(new Error('Kuzzle.document.delete: _id is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'delete'
    }, {_id}, options);
  }

  deleteByQuery(index, collection, body = {}, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.deleteByQuery: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.deleteByQuery: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'deleteByQuery'
    }, {body}, options);
  }

  get (index, collection, _id, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.get: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.get: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'get'
    }, {_id}, options);
  }

  mCreate (index, collection, documents, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mCreate: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mCreate: collection is required'));
    }
    if (!Array.isArray(documents)) {
      return Promise.reject(new Error('Kuzzle.document.mCreate: documents must be an array'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'mCreate'
    }, {body: {documents}}, options);
  }

  mCreateOrReplace (index, collection, documents, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mCreateOrReplace: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mCreateOrReplace: collection is required'));
    }
    if (!Array.isArray(documents)) {
      return Promise.reject(new Error('Kuzzle.document.mCreateOrReplace: documents must be an array'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'mCreateOrReplace'
    }, {body: {documents}}, options);
  }

  mDelete (index, collection, ids, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mDelete: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mDelete: collection is required'));
    }
    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('Kuzzle.document.mDelete: ids must be an array'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'mDelete'
    }, {body: {ids}}, options);
  }

  mGet (index, collection, ids, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mGet: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mGet: collection is required'));
    }
    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('Kuzzle.document.mGet: ids must be an array'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'mGet'
    }, {body: {ids}}, options);
  }

  mReplace (index, collection, documents, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mReplace: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mReplace: collection is required'));
    }
    if (!Array.isArray(documents)) {
      return Promise.reject(new Error('Kuzzle.document.mReplace: documents must be an array'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'mReplace'
    }, {body: {documents}}, options);
  }

  mUpdate (index, collection, documents, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.mUpdate: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.mUpdate: collection is required'));
    }
    if (!Array.isArray(documents)) {
      return Promise.reject(new Error('Kuzzle.document.mUpdate: documents must be an array'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'mUpdate'
    }, {body: {documents}}, options);
  }

  replace (index, collection, _id, body, options) {
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

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'replace'
    }, {_id, body}, options);
  }

  search (index, collection, body = {}, options) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.document.search: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.document.search: collection is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'search'
    }, {body}, options)
      .then(response => new DocumentSearchResult(this.kuzzle, {body}, options, response));
  }

  update (index, collection, _id, body, options) {
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

    return this.kuzzle.query({
      index,
      collection,
      controller: 'document',
      action: 'update'
    }, {body}, options);
  }

  validate (index, collection, body, options) {
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
      controller: 'document',
      action: 'validate'
    }, {body}, options);
  }
}

module.exports = DocumentController;
