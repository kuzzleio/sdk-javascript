import { BaseController } from './Base';
import { Observer } from '../core/Observer';
import { ObserverSearchResult } from '../core/searchResult/ObserverSearchResult';
import { SearchResult } from '../core/searchResult/SearchResultBase';
import { DocumentNotification, JSONObject } from '../types';
import { ObserversHandler } from '../core/ObserversHandler';
import { uuidv4 } from '../utils/uuidv4';

export class ObserveController extends BaseController {
  private observersHandlers: Map<string, ObserversHandler[]>;

  constructor (kuzzle) {
    super(kuzzle, 'observe');

    this.observersHandlers = new Map();
  }

  /**
   * Gets a document and return an observer.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/get/
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `reference` Optionnal string to identify the returned observer
   *    - `notifyOnly` If true, the returned observer will not mutate it's own content
   *
   * @returns The document as observer
   */
   get (
    index: string,
    collection: string,
    _id: string,
    options: { queuable?: boolean, reference?: string, notifyOnly?: boolean } = {}
  ): Promise<Observer> {
    return this.kuzzle.document.get(index, collection, _id, options)
      .then(document => {
        const reference = options.reference || uuidv4();
        const observer = new Observer(document, { notifyOnly: options.notifyOnly });
        const handler = new ObserversHandler(
          this.kuzzle,
          index,
          collection,
          [observer]);

        this.observersHandlers.set(reference, [handler]);

        return handler.start()
          .then(() => observer);
      });
  }

  /**
   * Gets multiple documents and return observers.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/document/m-get/
   *
   * @param index Index name
   * @param collection Collection name
   * @param ids Document IDs
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `verb` (HTTP only) Forces the verb of the route
   *    - `reference` Optionnal string to identify the returned observers
   *    - `notifyOnly` If true, the returned observer will not mutate it's own content
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
   mGet (
    index: string,
    collection: string,
    ids: Array<string>,
    options: { queuable?: boolean, verb?: string, reference?: string, notifyOnly?: boolean } = {}
  ): Promise<{
    /**
     * Array of successfully retrieved documents as observers
     */
    successes: Array<Observer>;
    /**
     * Array of the IDs of not found documents.
     */
    errors: Array<string>;
  }> {
    let _errors;

    return this.kuzzle.document.mGet(index, collection, ids, options)
      .then(({ successes, errors }) => {
        _errors = errors;

        const reference = options.reference || uuidv4();
        const observers = successes.map(document => {
          return new Observer(document, { notifyOnly: options.notifyOnly });
        });
        const handler = new ObserversHandler(
          this.kuzzle,
          index,
          collection,
          observers);

        this.observersHandlers.set(reference, [handler]);

        return handler.start()
          .then(() => ({ successes: observers, errors }));
      });
  }
  /**
   * Searches documents and return observers.
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
   *    - `reference` Optionnal string to identify the returned observers
   *    - `notifyOnly` If true, the returned observer will not mutate it's own content
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
      reference?: string;
      notifyOnly?: boolean;
    } = {}
  ): Promise<ObserverSearchResult> {
    const documentController: any = this.kuzzle.document;

    return documentController._search(index, collection, query, options)
      .then(({ response, request }) => {
        const reference = options.reference || uuidv4();
        this.observersHandlers.set(reference, []);

        const searchResult = new ObserverSearchResult(this.kuzzle,
          request,
          options,
          response.result,
          this.observersHandlers.get(reference),
          options.notifyOnly);

        return searchResult.start()
          .then(() => searchResult);
      });
  }

  /**
   * Cleans a set of observers or every active observers.
   */
  cleanObservers (reference?: string): Promise<void> {
    if (reference) {
      const handlers = this.observersHandlers.get(reference);

      if (! reference) {
        throw new Error(`Unknown observers reference "${reference}"`);
      }

      return this.stopObservers(handlers);
    }

    const promises = Object.values(this.observersHandlers)
        .map(handlers => this.stopObservers(handlers));

    return Promise.all(promises)
      .then(() => {});
  }

  private stopObservers (handlers: ObserversHandler[]) {
    const promises = handlers.map(handler => handler.stop());

    return Promise.all(promises)
      .then(() => {});
  }
}
