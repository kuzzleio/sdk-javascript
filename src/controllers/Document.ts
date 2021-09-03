import { BaseController } from './Base';
import { SearchResult } from '../core/searchResult/SearchResultBase';
import { DocumentSearchResult } from '../core/searchResult/Document';
import { JSONObject, Document, DocumentHit } from '../types';

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
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/count/
   *
   * @param index Index name
   * @param collection Collection name
   * @param query Query to match
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The number of matching documents
   */
  count (
    index: string,
    collection: string,
    body?: JSONObject,
    options: {
      queuable?: boolean,
      timeout?: number
    } = {}
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
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/create/
   *
   * @param index Index name
   * @param collection Collection name
   * @param content Document content
   * @param _id Optional document ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The created document
   */
  create (
    index: string,
    collection: string,
    content: JSONObject,
    _id: string = null,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number
    } = {}
  ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      body: content,
      action: 'create',
      silent: options.silent,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Creates a new document in the persistent data storage,
   * or replaces its content if it already exists.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/create-or-replace/
   *
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   * @param content Document content
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The created or replaced document
   */
  createOrReplace (
    index: string,
    collection: string,
    _id: string,
    content: JSONObject,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number
    } = {}
  ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      body: content,
      action: 'createOrReplace',
      silent: options.silent,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Deletes a document.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/delete/
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The document ID
   */
  delete (
    index: string,
    collection: string,
    _id: string,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number
    } = {}
  ): Promise<number> {
    const request = {
      index,
      collection,
      _id,
      action: 'delete',
      silent: options.silent,
    };

    return this.query(request, options)
      .then(response => response.result._id);
  }

  /**
   * Deletes documents matching the provided search query.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/delete-by-query/
   *
   * @param index Index name
   * @param collection Collection name
   * @param query Query to match
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `lang` Query syntax. Can be 'elasticsearch' or 'koncorde'
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The deleted documents IDs
   */
  deleteByQuery(
    index: string,
    collection: string,
    query: JSONObject = {},
    options: {
      queuable?: boolean,
      refresh?: string,
      silent?: boolean,
      lang?: string,
      timeout?: number
    } = {}
  ): Promise<Array<string>> {
    const request = {
      index,
      collection,
      body: query,
      action: 'deleteByQuery',
      lang: options.lang,
      silent: options.silent,
    };

    return this.query(request, options)
      .then(response => response.result.ids);
  }

  /**
   * Deletes fields of an existing document.
   *
   * @see https://docs.kuzzle.io/core/2/api/controllers/document/delete-fields/
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `source` If true, the response will contain the updated document
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The updated document
   */
  deleteFields(
    index: string,
    collection: string,
    _id: string,
    fields: string[],
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      source?: boolean,
      timeout?: number,
    } = {}
  ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      body: { fields },
      action: 'deleteFields',
      silent: options.silent,
      source: options.source,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Checks if the given document exists.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/exists/
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns True if the document exists
   */
  exists (
    index: string,
    collection: string,
    _id: string,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number
    } = {}
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
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/get/
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The document
   */
  get (
    index: string,
    collection: string,
    _id: string,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number
    } = {}
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
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-create/
   *
   * @param index Index name
   * @param collection Collection name
   * @param documents Documents to create
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `strict` If true, an error will occur if a document was not created
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
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number,
      strict?: boolean
    } = {}
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
      action: 'mCreate',
      silent: options.silent,
      strict: options.strict,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Creates or replaces multiple documents.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-create-or-replace/
   *
   * @param index Index name
   * @param collection Collection name
   * @param documents Documents to create
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `strict` If true, an error will occur if a document was not created
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mCreateOrReplace (
    index: string,
    collection: string,
    documents: Array<{
      /**
       * Document ID
       */
      _id: string;
      /**
       * Document content
       */
      body: JSONObject;
    }>,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number,
      strict?: boolean
    } = {}
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
      action: 'mCreateOrReplace',
      silent: options.silent,
      strict: options.strict,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Deletes multiple documents.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-delete/
   *
   * @param index Index name
   * @param collection Collection name
   * @param ids Document IDs
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `strict` If true, an error will occur if a document was not deleted
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mDelete (
    index: string,
    collection: string,
    ids: Array<string>,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number,
      strict?: boolean
    } = {}
  ): Promise<{
    /**
     * Array of successfully deleted documents IDS
     */
    successes: Array<string>;
    /**
     * Array of failed deletion
     */
    errors: Array<{
      /**
       * Document ID
       */
      id: string;
      /**
       * Human readable reason
       */
      reason: string;
    }>;
  }> {
    const request = {
      index,
      collection,
      body: { ids },
      action: 'mDelete',
      silent: options.silent,
      strict: options.strict,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Gets multiple documents.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-get/
   *
   * @param index Index name
   * @param collection Collection name
   * @param ids Document IDs
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `verb` (HTTP only) Forces the verb of the route
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mGet (
    index: string,
    collection: string,
    ids: Array<string>,
    options: {
      queuable?: boolean,
      verb?: string,
      timeout?: number
    } = {}
  ): Promise<{
    /**
     * Array of successfully retrieved documents
     */
    successes: Array<Document>;
    /**
     * Array of the IDs of not found documents.
     */
    errors: Array<string>;
  }> {
    const request = {
      index,
      collection,
      action: 'mGet',
      body: { ids },
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Replaces multiple documents.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-replace/
   *
   * @param index Index name
   * @param collection Collection name
   * @param documents Documents to create
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `strict` If true, an error will occur if a document was not replaced
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mReplace (
    index: string,
    collection: string,
    documents: Array<{
      /**
       * Document ID
       */
      _id: string;
      /**
       * Document content
       */
      body: JSONObject;
    }>,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number,
      strict?: boolean
    } = {}
  ): Promise<{
    /**
     * Array of successfully replaced documents
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
      action: 'mReplace',
      silent: options.silent,
      strict: options.strict,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Updates multiple documents.
   *
   * Conflicts may occur if the same document gets updated multiple times
   * within a short timespan in a database cluster. (See `retryOnConflict`)
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-update/
   *
   * @param index Index name
   * @param collection Collection name
   * @param documents Documents to create
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `retryOnConflict` Number of times the database layer should retry in case of version conflict
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `strict` If true, an error will occur if a document was not updated
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mUpdate (
    index: string,
    collection: string,
    documents: Array<{
      /**
       * Document ID
       */
      _id: string;
      /**
       * Document content
       */
      body: JSONObject;
    }>,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      retryOnConflict?: number,
      timeout?: number
      strict?: boolean,
    } = {}
  ): Promise<{
    /**
     * Array of successfully updated documents
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
      action: 'mUpdate',
      silent: options.silent,
      strict: options.strict,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Applies partial updates to multiple documents.
   *
   * If a document doesn't already exist, a new document is created.
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-upsert/
   *
   * @param index Index name
   * @param collection Collection name
   * @param documents Documents to update
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `retryOnConflict` Number of times the database layer should retry in case of version conflict
   *    - `strict` If true, an error will occur if a document was not updated
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mUpsert (
    index: string,
    collection: string,
    documents: Array<{
      /**
       * Document ID
       */
      _id: string;
      /**
       * Partial content of the document to update
       */
      changes: JSONObject;
      /**
       * Fields to add to the document if it gets created
       */
      default: JSONObject
    }>,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      retryOnConflict?: number,
      strict?: boolean
    } = {}
  ): Promise<{
    /**
     * Array of successfully updated documents
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
      action: 'mUpsert',
      silent: options.silent,
      strict: options.strict,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Replaces the content of an existing document.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/replace/
   *
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   * @param content Document content
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The replaced document
   */
  replace (
    index: string,
    collection: string,
    _id: string,
    content: JSONObject,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      timeout?: number
    } = {}
  ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      body: content,
      action: 'replace',
      silent: options.silent,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Searches documents.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/search/
   *
   * @param index Index name
   * @param collection Collection name
   * @param query Search query
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `from` Offset of the first document to fetch
   *    - `size` Maximum number of documents to retrieve per page
   *    - `scroll` When set, gets a forward-only cursor having its ttl set to the given value (e.g. `30s`)
   *    - `verb` (HTTP only) Forces the verb of the route
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns A SearchResult
   */
  search (
    index: string,
    collection: string,
    query: JSONObject = {},
    options: {
      queuable?: boolean;
      from?: number;
      size?: number;
      scroll?: string;
      lang?: string;
      verb?: string;
      timeout?: number;
    } = {}
  ): Promise<SearchResult<DocumentHit>> {
    return this._search(index, collection, query, options)
      .then(({ response, request, opts }) => (
        new DocumentSearchResult(this.kuzzle, request, opts, response.result)
      ));
  }

  private _search (
    index: string,
    collection: string,
    body: JSONObject = {},
    options: JSONObject = {}
  ) {
    const request: any = {
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
    for (const opt of ['from', 'size', 'scroll', 'lang']) {
      request[opt] = options[opt];
    }

    const opts = { verb: options.verb || 'POST', ...options };
    return this.query(request, opts)
      .then(response => ({ response, request, opts }));
  }

  /**
   * Updates the content of an existing document.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/update/
   *
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   * @param content Document content
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `retryOnConflict` Number of times the database layer should retry in case of version conflict
   *    - `source` If true, returns the updated document inside the response
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The replaced document
   */
  update (
    index: string,
    collection: string,
    _id: string,
    content: JSONObject,
    options: {
      queuable?: boolean,
      refresh?: 'wait_for',
      silent?: boolean,
      retryOnConflict?: number,
      source?: boolean,
      timeout?: number
    } = {}
  ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      body: content,
      action: 'update',
      retryOnConflict: options.retryOnConflict,
      source: options.source,
      silent: options.silent,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Updates documents matching the provided search query.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/update-by-query/
   *
   * @param index Index name
   * @param collection Collection name
   * @param query Query to match
   * @param changes Partial changes to apply to the documents
   * @param options Additional options
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `source` If true, returns the updated document inside the response
   *    - `lang` Query syntax. Can be 'elasticsearch' or 'koncorde'
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  updateByQuery(
    index: string,
    collection: string,
    query: JSONObject,
    changes: JSONObject,
    options: {
      refresh?: 'wait_for',
      silent?: boolean,
      source?: boolean,
      lang?: string,
      timeout?: number
    } = {}
  ): Promise<{
    /**
     * Array of successfully updated documents
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
      body: { query, changes },
      action: 'updateByQuery',
      source: options.source,
      lang: options.lang,
      silent: options.silent,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Applies a partial update to an existing document.
   * If the document doesn't already exist, a new document is created.
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/upsert/
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Unique document identifier
   * @param changes Partial content of the document to update
   * @param [options]
   *    - `default` Fields to add to the document if it gets created
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `silent` If true, then Kuzzle will not generate notifications
   *    - `retryOnConflict` Number of times the database layer should retry in case of version conflict
   *    - `source` If true, returns the updated document inside the response
   *
   * @returns Information about the updated document
  */
  upsert (
    index: string,
    collection: string,
    _id: string,
    changes: JSONObject,
    options: {
      default?: JSONObject;
      refresh?: string,
      silent?: boolean,
      retryOnConflict?: boolean,
      source?: boolean,
      timeout?: number
    } = {}
  ): Promise<Document> {
    const request = {
      index,
      collection,
      _id,
      body: { changes, default: options.default },
      action: 'upsert',
      source: options.source,
      silent: options.silent,
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Validates a document against existing validation rules.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/validate/
   *
   * @param index Index name
   * @param collection Collection name
   * @param content Document content
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns True if the document is valid
   */
  validate (
    index: string,
    collection: string,
    content: JSONObject,
    options: {
      queuable?: boolean,
      timeout?: number
    } = {}
  ): Promise<boolean> {
    return this.query({
      index,
      collection,
      body: content,
      action: 'validate'
    }, options)
      .then(response => response.result);
  }
}
