import { BaseController } from './Base';
import { RealtimeDocument } from '../core/RealtimeDocument';
import { RealtimeDocumentSearchResult } from '../core/searchResult/RealtimeDocumentSearchResult';
import { JSONObject } from '../types';
import { RealtimeDocumentsHandler } from '../core/RealtimeDocumentsHandler';
import { uuidv4 } from '../utils/uuidv4';

export class ObserveController extends BaseController {
  private realtimeDocumentsHandlers: Map<string, RealtimeDocumentsHandler[]>;

  constructor (kuzzle) {
    super(kuzzle, 'observe');

    this.realtimeDocumentsHandlers = new Map();
  }

  /**
   * Gets a realtime document.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/get/
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `reference` Optionnal string to identify the returned realtime document
   *    - `mutate` If true, the returned realtime document will not mutate it's own content
   *
   * @returns The document as realtime document
   */
   get (
    index: string,
    collection: string,
    _id: string,
    options: { queuable?: boolean, reference?: string, mutate?: boolean } = {}
  ): Promise<RealtimeDocument> {
    return this.kuzzle.document.get(index, collection, _id, options)
      .then(document => {
        const reference = options.reference || uuidv4();
        const realtimeDocument = new RealtimeDocument(document, { mutate: options.mutate });
        const handler = new RealtimeDocumentsHandler(
          this.kuzzle,
          index,
          collection,
          [realtimeDocument]);

        this.realtimeDocumentsHandlers.set(reference, [handler]);

        return handler.start()
          .then(() => realtimeDocument);
      });
  }

  /**
   * Gets multiple realtime documents.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-get/
   *
   * @param index Index name
   * @param collection Collection name
   * @param ids Document IDs
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `verb` (HTTP only) Forces the verb of the route
   *    - `reference` Optionnal string to identify the returned realtime documents
   *    - `mutate` If false, the realtime document will not mutate it's own content but only emit events
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
   mGet (
    index: string,
    collection: string,
    ids: Array<string>,
    options: { queuable?: boolean, verb?: string, reference?: string, mutate?: boolean } = {}
  ): Promise<{
    /**
     * Array of successfully retrieved documents as realtimeDocuments
     */
    successes: Array<RealtimeDocument>;
    /**
     * Array of the IDs of not found documents.
     */
    errors: Array<string>;
  }> {
    return this.kuzzle.document.mGet(index, collection, ids, options)
      .then(({ successes, errors }) => {
        const reference = options.reference || uuidv4();
        const realtimeDocuments = successes.map(document => {
          return new RealtimeDocument(document, { mutate: options.mutate });
        });
        const handler = new RealtimeDocumentsHandler(
          this.kuzzle,
          index,
          collection,
          realtimeDocuments);

        // @todo clean handlers or reject if exists
        this.realtimeDocumentsHandlers.set(reference, [handler]);

        return handler.start()
          .then(() => ({ successes: realtimeDocuments, errors }));
      });
  }
  /**
   * Searches documents.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/observe/search/
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
   *    - `reference` Optionnal string to identify the returned realtimeDocuments
   *    - `mutate` If false, the realtime document will not mutate it's own content but only emit events
   *
   * @returns A RealtimeDocumentSearchResult
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
      reference?: string;
      mutate?: boolean;
    } = {}
  ): Promise<RealtimeDocumentSearchResult> {
    const documentController: any = this.kuzzle.document;

    return documentController._search(index, collection, query, options)
      .then(({ response, request }) => {
        const reference = options.reference || uuidv4();
        // @todo clean handlers or reject if exists
        this.realtimeDocumentsHandlers.set(reference, []);

        const searchResult = new RealtimeDocumentSearchResult(this.kuzzle,
          request,
          options,
          response.result,
          this.realtimeDocumentsHandlers.get(reference),
          options.mutate);

        return searchResult.start()
          .then(() => searchResult);
      });
  }

  getHandlers (reference: string): RealtimeDocumentsHandler[] {
    const handlers = this.realtimeDocumentsHandlers.get(reference);

    if (! reference) {
      throw new Error(`Unknown realtimeDocuments reference "${reference}"`);
    }

    return handlers;
  }

  /**
   * Cleans a set of realtimeDocuments or every active realtimeDocuments.
   */
  cleanRealtimeDocuments (reference?: string): Promise<void> {
    if (reference) {
      return this.stopRealtimeDocuments(this.getHandlers(reference));
    }

    const promises = Object.values(this.realtimeDocumentsHandlers)
        .map(handlers => this.stopRealtimeDocuments(handlers));

    return Promise.all(promises)
      .then(() => {});
  }

  private stopRealtimeDocuments (handlers: RealtimeDocumentsHandler[]) {
    const promises = handlers.map(handler => handler.stop());

    return Promise.all(promises)
      .then(() => {});
  }
}
