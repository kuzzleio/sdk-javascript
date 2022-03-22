import { BaseController } from './Base';
import { DocumentSearchResult } from '../core/searchResult/Document';
import {
  JSONObject,
  mCreateResponse,
  ArgsDefault,
  mCreateRequest,
  mCreateOrReplaceRequest,
  mCreateOrReplaceResponse,
  mDeleteRequest,
  mDeleteResponse,
  mReplaceRequest,
  mReplaceResponse,
  mUpdateRequest,
  mUpdateResponse,
  KDocumentContentGeneric,
  KDocument,
  KHit,
} from '../types';
import { SearchResult } from '../core/searchResult/SearchResultBase';

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
    options: ArgsDocumentControllerCount = {}
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
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The created document
   */
  create<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    content: Partial<TKDocumentContent>,
    _id: string = null,
    options: ArgsDocumentControllerCreate = {}
  ): Promise<KDocument<TKDocumentContent>> {
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
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The created or replaced document
   */
  createOrReplace<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    _id: string,
    content: Partial<TKDocumentContent>,
    options: ArgsDocumentControllerCreateOrReplace = {}
  ): Promise<KDocument<TKDocumentContent>> {
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
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The document ID
   */
  delete (
    index: string,
    collection: string,
    _id: string,
    options: ArgsDocumentControllerDelete = {}
  ): Promise<string> {
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
  deleteByQuery (
    index: string,
    collection: string,
    query: JSONObject = {},
    options: ArgsDocumentControllerDeleteByQuery = {}
  ): Promise<string[]> {
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
  deleteFields<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    _id: string,
    fields: string[],
    options: ArgsDocumentControllerDeleteFields = {}
  ): Promise<KDocument<TKDocumentContent>> {
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
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns True if the document exists
   */
  exists (
    index: string,
    collection: string,
    _id: string,
    options: ArgsDocumentControllerExists = {}
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
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The document
   */
  get<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    _id: string,
    options: ArgsDocumentControllerGet = {}
  ): Promise<KDocument<TKDocumentContent>> {
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
  mCreate<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    documents: mCreateRequest<TKDocumentContent>,
    options: ArgsDocumentControllerMCreate = {}
  ): Promise<mCreateResponse> {
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
  mCreateOrReplace<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    documents: mCreateOrReplaceRequest<TKDocumentContent>,
    options: ArgsDocumentControllerMCreateOrReplace = {}
  ): Promise<mCreateOrReplaceResponse> {
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
    ids: mDeleteRequest,
    options: ArgsDocumentControllerMDelete = {}
  ): Promise<mDeleteResponse> {
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
  mGet<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    ids: string[],
    options: ArgsDocumentControllerMGet = {}
  ): Promise<{
    /**
     * Array of successfully retrieved documents
     */
    successes: KDocument<TKDocumentContent>[];
    /**
     * Array of the IDs of not found documents.
     */
    errors: string[];
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
  mReplace<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    documents: mReplaceRequest<TKDocumentContent>,
    options: ArgsDocumentControllerMReplace = {}
  ): Promise<mReplaceResponse> {
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
  mUpdate<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    documents: mUpdateRequest<TKDocumentContent>,
    options: ArgsDocumentControllerMUpdate = {}
  ): Promise<mUpdateResponse> {
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
  mUpsert<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    documents: mUpdateRequest<TKDocumentContent>,
    options: ArgsDocumentControllerMUpsert = {}
  ): Promise<mUpdateResponse> {
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
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The replaced document
   */
  replace<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    _id: string,
    content: Partial<TKDocumentContent>,
    options: ArgsDocumentControllerReplace = {}
  ): Promise<KDocument<TKDocumentContent>> {
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
   * @param searchBody Search query
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
  search<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    searchBody: JSONObject = {},
    options: ArgsDocumentControllerSearch = {}
  ): Promise<SearchResult<KHit<TKDocumentContent>>> {
    return this._search(index, collection, searchBody, options)
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
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.retryOnConflict Number of times the database layer should retry in case of version conflict
   * @param options.source If true, returns the updated document inside the response
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The replaced document
   */
  update<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    _id: string,
    content: Partial<TKDocumentContent>,
    options: ArgsDocumentControllerUpdate = {}
  ): Promise<KDocument<TKDocumentContent>> {
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
  updateByQuery<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    query: JSONObject,
    changes: JSONObject,
    options: ArgsDocumentControllerUpdateByQuery = {}
  ): Promise<{
    /**
     * Array of successfully updated documents
     */
    successes: KDocument<TKDocumentContent>[];
    /**
     * Array of failed creation
     */
    errors: Array<{
      /**
       * Document that cause the error
       */
      document: KDocument<TKDocumentContent>;
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
  upsert<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    _id: string,
    changes: Partial<TKDocumentContent>,
    options: ArgsDocumentControllerUpsert = {}
  ): Promise<KDocument<TKDocumentContent>> {
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
  validate<TKDocumentContent extends KDocumentContentGeneric> (
    index: string,
    collection: string,
    content: TKDocumentContent,
    options: ArgsDocumentControllerValidate = {}
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

export interface ArgsDocumentControllerCount extends ArgsDefault {
}

export interface ArgsDocumentControllerCreate extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
}

export interface ArgsDocumentControllerCreateOrReplace extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
}

export interface ArgsDocumentControllerDelete extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
}

export interface ArgsDocumentControllerDeleteByQuery extends ArgsDefault {
    refresh?: string;
    silent?: boolean;
    lang?: string;
}

export interface ArgsDocumentControllerDeleteFields extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    source?: boolean;
}

export interface ArgsDocumentControllerExists extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
}

export interface ArgsDocumentControllerGet extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
}

export interface ArgsDocumentControllerMCreate extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    strict?: boolean;
}

export interface ArgsDocumentControllerMCreateOrReplace extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    strict?: boolean;
}

export interface ArgsDocumentControllerMDelete extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    strict?: boolean;
}

export interface ArgsDocumentControllerMGet extends ArgsDefault {
    verb?: string;
}

export interface ArgsDocumentControllerMReplace extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    strict?: boolean;
}

export interface ArgsDocumentControllerMUpdate extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    retryOnConflict?: number;
    strict?: boolean;
}

export interface ArgsDocumentControllerMUpsert extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    retryOnConflict?: number;
    strict?: boolean;
}

export interface ArgsDocumentControllerReplace extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
}

export interface ArgsDocumentControllerSearch extends ArgsDefault {
    from?: number;
    size?: number;
    scroll?: string;
    lang?: string;
    verb?: string;
}

export interface ArgsDocumentControllerUpdate extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    retryOnConflict?: number;
    source?: boolean;
}

export interface ArgsDocumentControllerUpdateByQuery extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
    silent?: boolean;
    source?: boolean;
    lang?: string;
}

export interface ArgsDocumentControllerUpsert extends ArgsDefault {
    default?: JSONObject;
    refresh?: string;
    silent?: boolean;
    retryOnConflict?: boolean;
    source?: boolean;
}

export interface ArgsDocumentControllerValidate extends ArgsDefault {
}
