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
    const request = {
      index,
      collection,
      body,
      action: 'count'
    };

    return this.query(request, options)
      .then(response => response.result.count);
  }

  create (index, collection, document, _id = null, options = {}) {
    const request = {
      index,
      collection,
      _id,
      body: document,
      action: 'create'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  createOrReplace (index, collection, _id, body, options = {}) {
    const request = {
      index,
      collection,
      _id,
      body,
      action: 'createOrReplace'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  delete (index, collection, _id, options = {}) {
    const request = {
      index,
      collection,
      _id,
      action: 'delete'
    };

    return this.query(request, options)
      .then(response => response.result._id);
  }

  deleteByQuery(index, collection, body = {}, options = {}) {
    const request = {
      index,
      collection,
      body,
      action: 'deleteByQuery'
    };

    return this.query(request, options)
      .then(response => response.result.ids);
  }

  exists (index, collection, _id, options = {}) {
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
    const request = {
      index,
      collection,
      _id,
      action: 'get'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mCreate (index, collection, documents, options = {}) {
    const request = {
      index,
      collection,
      body: {documents},
      action: 'mCreate'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mCreateOrReplace (index, collection, documents, options = {}) {
    const request = {
      index,
      collection,
      body: {documents},
      action: 'mCreateOrReplace'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mDelete (index, collection, ids, options = {}) {
    const request = {
      index,
      collection,
      body: {ids},
      action: 'mDelete'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mGet (index, collection, ids, options = {}) {
    const request = {
      index,
      collection,
      action: 'mGet',
      body: {ids}
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mReplace (index, collection, documents, options = {}) {
    const request = {
      index,
      collection,
      body: {documents},
      action: 'mReplace'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mUpdate (index, collection, documents, options = {}) {
    const request = {
      index,
      collection,
      body: {documents},
      action: 'mUpdate'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  replace (index, collection, _id, body, options = {}) {
    const request = {
      index,
      collection,
      _id,
      body,
      action: 'replace'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  search (index, collection, body = {}, options = {}) {
    return this._search(index, collection, body, options)
      .then(({ response, request }) => (
        new DocumentSearchResult(this.kuzzle, request, options, response.result)
      ));
  }

  _search (index, collection, body = {}, options = {}) {
    const request = {
      index,
      collection,
      body,
      action: 'search',
    };

    for (const opt of ['from', 'size', 'scroll']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    if (request.size === undefined) {
      request.size = 10;
    }

    if (!request.scroll && !request.body.sort && !request.from) {
      request.from = 0;
    }

    return this.query(request, options)
      .then(response => ({ response, request }));
  }

  update (index, collection, _id, body, options = {}) {
    const request = {
      index,
      collection,
      _id,
      body,
      action: 'update',
      retryOnConflict: options.retryOnConflict,
      source: options.source
    };
    delete options.source;
    delete options.retryOnConflict;

    return this.query(request, options)
      .then(response => response.result);
  }

  validate (index, collection, body, options = {}) {
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
