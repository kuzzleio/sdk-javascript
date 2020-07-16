import { BaseController } from './Base';
import { DocumentsSearchResult } from '../core/searchResult/Document';
import { JSONObject, Document } from '../utils/interfaces';

export class DocumentController extends BaseController {
  constructor (kuzzle) {
    super(kuzzle, 'document');
  }

  /**
   * Counts documents in a collection.
   *
   * A query can be provided to alter the count result,
   * otherwise returns the total number of documents in the collection.
   *
   * @param index Index name
   * @param collection Collection name
   * @param query Query to match
   * @param options Additional options
   *    - "queuable" If true, queues the request during downtime, until connected to Kuzzle again
   *
   * @returns The number of matching documents
   */
  count (
    index: string,
    collection: string,
    body: JSONObject,
    options: { queuable?: boolean } = {}
  ): Promise<number> {
    const request = {
      index,
      collection,
      body,
      action: 'count'
    };

    return this.query(request, options)
      .then(response => response.result.count);
  }

  /**
   * Creates a new document in the persistent data storage.
   *
   * @param index Index name
   * @param collection Collection name
   * @param content Document content
   * @param _id Optional document ID
   * @param options Additional options
   *    - "queuable" If true, queues the request during downtime, until connected to Kuzzle again
   *    - "refresh" If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *
   * @returns The created document
   */
  create (
    index: string,
    collection: string,
    content: JSONObject,
    _id: string = null,
    options: { queuable?: boolean, refresh?: string } = {}
  ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      body: content,
      action: 'create'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Creates a new document in the persistent data storage,
   * or replaces its content if it already exists.
   *
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   * @param content Document content
   * @param options Additional options
   *    - "queuable" If true, queues the request during downtime, until connected to Kuzzle again
   *    - "refresh" If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *
   * @returns The created or replaced document
   */
  createOrReplace (
    index: string,
    collection: string,
    _id: string,
    content: JSONObject,
    options: { queuable?: boolean, refresh?: string } = {}
  ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      body: content,
      action: 'createOrReplace'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Deletes a document.
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - "queuable" If true, queues the request during downtime, until connected to Kuzzle again
   *    - "refresh" If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *
   * @returns The document ID
   */
  delete (
    index: string,
    collection: string,
    _id: string,
    options: { queuable?: boolean, refresh?: string } = {}
  ): Promise<number> {
    const request = {
      index,
      collection,
      _id,
      action: 'delete'
    };

    return this.query(request, options)
      .then(response => response.result._id);
  }

  /**
   * Deletes documents matching the provided search query.
   *
   * @param index Index name
   * @param collection Collection name
   * @param query Query to match
   * @param options Additional options
   *    - "queuable" If true, queues the request during downtime, until connected to Kuzzle again
   *    - "refresh" If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *
   * @returns The deleted documents IDs
   */
  deleteByQuery(
    index: string,
    collection: string,
    query: JSONObject = {},
    options: { queuable?: boolean, refresh?: string } = {}
  ): Promise<Array<string>> {
    const request = {
      index,
      collection,
      body: query,
      action: 'deleteByQuery'
    };

    return this.query(request, options)
      .then(response => response.result.ids);
  }

  /**
   * Checks if the given document exists.
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - "queuable" If true, queues the request during downtime, until connected to Kuzzle again
   *    - "refresh" If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *
   * @returns True if the document exists
   */
  exists (
    index: string,
    collection: string,
    _id: string,
    options: { queuable?: boolean, refresh?: string } = {}
  ): Promise<boolean> {
    const request = {
      index,
      collection,
      _id,
      action: 'exists'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Gets a document.
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - "queuable" If true, queues the request during downtime, until connected to Kuzzle again
   *    - "refresh" If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *
   * @returns The document
   */
  get (
    index: string,
    collection: string,
    _id: string,
    options: { queuable?: boolean, refresh?: string } = {}
   ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      action: 'get'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Creates multiple documents.
   *
   * @param index Index name
   * @param collection Collection name
   * @param documents Documents to create
   * @param options Additional options
   *    - "queuable" If true, queues the request during downtime, until connected to Kuzzle again
   *    - "refresh" If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mCreate (
    index: string,
    collection: string,
    documents: Array<{
      /**
       * Optional document ID
       */
      _id?: string;
      /**
       * Document content
       */
      body: JSONObject;
    }>,
    options: { queuable?: boolean, refresh?: string } = {}
  ): Promise<{
    /**
     * Array of successfully created documents
     */
    successes: Array<Document>;
    /**
     * Array of failed creation
     */
    errors: Array<{
      /**
       * Document that cause the error
       */
      document: Document;
      /**
       * HTTP error status
       */
      status: number;
      /**
       * Human readable reason
       */
      reason: string;
    }>;
  }> {
    const request = {
      index,
      collection,
      body: { documents },
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
      .then(({ response, request, opts }) => (
        new DocumentsSearchResult(this.kuzzle, request, opts, response.result)
      ));
  }

  _search (index, collection, body = {}, options = {}) {
    const request = {
      index,
      collection,
      body: null,
      action: 'search',
    };
    if ( this.kuzzle.protocol.name === 'http'
      && options.verb
      && options.verb.toLowerCase() === 'get'
    ) {
      request.searchBody = body;
    }
    else {
      request.body = body;
    }
    for (const opt of ['from', 'size', 'scroll']) {
      request[opt] = options[opt];
    }

    const opts = { verb: options.verb || 'POST', ...options };
    return this.query(request, opts)
      .then(response => ({ response, request, opts }));
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

    return this.query(request, options)
      .then(response => response.result);
  }

  updateByQuery(index, collection, searchQuery, changes, options = {}) {
    const request = {
      index,
      collection,
      body: {query: searchQuery, changes},
      action: 'updateByQuery',
      source: options.source
    };

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

module.exports = { DocumentController };
