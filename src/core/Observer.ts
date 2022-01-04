import { Kuzzle } from '../Kuzzle';
import { RealtimeDocument } from './RealtimeDocument';
import { Document, DocumentNotification, JSONObject } from '../types';
import { RealtimeDocumentSearchResult } from './searchResult/RealtimeDocument';
import {
  ArgsDocumentControllerGet,
  ArgsDocumentControllerMGet,
  ArgsDocumentControllerSearch,
} from '../controllers/Document';

/**
 * Class based on a Set<string> that holds the observed documents IDs of
 * a specific collection.
 *
 * @internal
 */
class ObservedDocuments extends Set<string> {
  /**
   * Index name
   */
  public index: string;

  /**
   * Collection name
   */
  public collection: string;

  /**
   * Room ID for the realtime subscription on the collection of observed documents
   */
  public roomId: string = null;

  /**
   * Gets documents IDs
   */
  get ids (): string[] {
    return Array.from(this.values());
  }

  /**
   * Gets Koncorde filters for observed documents
   */
  get filters () {
    return {
      ids: { values: Array.from(this.values()) }
    };
  }

  constructor (index: string, collection: string) {
    super();

    this.index = index;
    this.collection = collection;
  }
}

type DocumentUrn = string;
type CollectionUrn = string;

/**
 * Provide an Uniform Resource Locator given an index, a collection and a document
 */
function documentUrn (index: string, collection: string, id: string): DocumentUrn {
  return `${index}:${collection}:${id}`;
}

/**
 * Provide an Uniform Resource Locator given an index and a collection
 */
function collectionUrn (index: string, collection: string): CollectionUrn {
  return `${index}:${collection}`;
}

export type ObserverOptions = {
  /**
   * Refresh delay in ms when the SDK is using the HTTP protocol.
   *
   * @default 5000
   */
  pullingDelay: number,
};

/**
 * The Observer class allows to manipulate realtime documents.
 *
 * A RealtimeDocument is like a normal document from Kuzzle except that it is
 * connected to the realtime engine and its content will change with changes
 * occuring on the database.
 *
 * They can be retrieved using methods with the same syntax as in the Document
 * Controller:
 *
 * ```js
 * const docs = await observer.get('montenegro', 'budva', 'foobar');
 *
 * const result = await observer.search('montenegro', 'budva', { query: { exists: 'beaches' } });
 * ```
 *
 * Realtime documents are resources that should be disposed either with the
 * stop() or the dispose() method otherwise subscriptions will never be
 * terminated, documents will be keep into memory and you will end with a
 * memory leak.
 *
 * ```js
 * await observer.stop('nyc-open-data', 'yellow-taxi');
 * ```
 *
 * A good frontend practice is to instantiate one observer for the actual page
 * and/or component(s) displaying realtime documents and to dispose them when
 * they are not displayed anymore.
 *
 * If the SDK is using the HTTP protocol, then documents are retrieved through the
 * document.mGet method every specified interval (default is 5 sec). This interval
 * can be modified with the `pullingDelay` option of the constructor.
 */
export class Observer {
  /**
   * Map used to keep track of the observed documents ids by collections.
   *
   * @internal
   */
  private documentsByCollection = new Map<CollectionUrn, ObservedDocuments>();

  /**
   * Map containing the list of realtime documents managed by this observer.
   *
   * This map is used to update realtime documents content when notifications
   * are received.
   *
   * @internal
   */
  private documents = new Map<DocumentUrn, RealtimeDocument>();

  /**
   * @internal
   */
  private sdk: Kuzzle;

  /**
   * @internal
   */
  private options: ObserverOptions = {
    pullingDelay: 5000,
  };

  /**
   * @internal
   */
  private pullingTimer: NodeJS.Timeout;

  /**
   * Method to refresh documents.
   * Either through the realtime notifications system or by pulling documents
   * with the document.mGet method (HTTP protocol)
   */
  public mode: 'realtime' | 'pulling';

  /**
   * Instantiate a new Observer
   *
   * @param sdk SDK instance
   */
  constructor (sdk: Kuzzle, options?: ObserverOptions) {
    Reflect.defineProperty(this, 'sdk', {
      value: sdk
    });

    this.options = { ...this.options, ...options };

    this.mode = this.sdk.protocol.name === 'http' ? 'pulling' : 'realtime';
  }

  /**
   * Stop observing documents and release associated ressources.
   *
   * Can be used either with:
   *  - a list of documents from a collection: stop observing those documents
   *  - an index and collection: stop observing all documents in the collection
   *
   * @param index Index name
   * @param collection Collection name
   * @param documents Array of documents
   *
   */
  stop (
    index?: string,
    collection?: string,
    documents?: Array<{ _id: string }>
  ): Promise<void> {
    if (index && collection && documents) {
      return this.disposeDocuments(index, collection, documents);
    }

    if (index && collection) {
      return this.disposeCollection(index, collection);
    }

    if (index) {
      return Promise.reject(new Error('Missing "collection" argument"'));
    }

    return this.disposeAll();
  }

  private disposeDocuments (
    index: string,
    collection: string,
    documents: Array<{ _id: string }>
  ): Promise<void> {
    const observedDocuments = this.documentsByCollection.get(collectionUrn(index, collection));

    for (const document of documents) {
      this.documents.delete(documentUrn(index, collection, document._id));

      observedDocuments.delete(document._id);
    }

    if (observedDocuments.size === 0) {
      this.documentsByCollection.delete(collectionUrn(index, collection));
    }

    return this.watchCollection(index, collection);
  }

  private disposeCollection (index: string, collection: string): Promise<void> {
    const observedDocuments = this.documentsByCollection.get(collectionUrn(index, collection));

    for (const id of observedDocuments.ids) {
      this.documents.delete(documentUrn(index, collection, id));
    }

    this.documentsByCollection.delete(collectionUrn(index, collection));

    return this.mode === 'realtime'
      ? this.sdk.realtime.unsubscribe(observedDocuments.roomId)
      : this.clearPullingTimer();
  }

  /**
   * Unsubscribe from every collections and clear all the realtime documents.
   *
   * @internal
   */
  private disposeAll (): Promise<void> {
    const promises = [];

    for (const observedDocuments of this.documentsByCollection.values()) {
      if (observedDocuments.roomId) {
        promises.push(this.sdk.realtime.unsubscribe(observedDocuments.roomId));
      }
    }

    if (this.mode === 'pulling') {
      promises.push(this.clearPullingTimer());
    }

    this.documentsByCollection.clear();
    this.documents.clear();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return Promise.all(promises).then(() => {});
  }

  /**
   * Gets a realtime document
   *
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   * @param options Additional options
   *
   * @returns The realtime document
   */
  get (
    index: string,
    collection: string,
    id: string,
    options: ArgsDocumentControllerGet = {}
  ): Promise<RealtimeDocument> {
    return this.sdk.document.get(index, collection, id, options)
      .then(document => this.observe(index, collection, document));
  }

  /**
   *
   * Gets multiple realtime documents.
   *
   * @param index Index name
   * @param collection Collection name
   * @param ids Document IDs
   * @param options Additional options
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mGet (
    index: string,
    collection: string,
    ids: string[],
    options: ArgsDocumentControllerMGet = {},
  ): Promise<{
    /**
     * Array of successfully retrieved documents
     */
    successes: RealtimeDocument[];
    /**
     * Array of the IDs of not found documents.
     */
    errors: string[];
  }> {
    const rtDocuments = [];
    let _errors;

    return this.sdk.document.mGet(index, collection, ids, options)
      .then(({ successes, errors }) => {
        _errors = errors;

        for (const document of successes) {
          rtDocuments.push(this.addDocument(index, collection, document));
        }

        return this.watchCollection(index, collection);
      })
      .then(() => ({ successes: rtDocuments, errors: _errors }));
  }

  /**
   * Searches for documents and returns a SearchResult containing realtime
   * documents.
   *
   * @param index Index name
   * @param collection Collection name
   * @param searchBody Search query
   * @param options Additional options
   *
   * @returns A SearchResult containing realtime documents
   */
  search (
    index: string,
    collection: string,
    searchBody: JSONObject = {},
    options: ArgsDocumentControllerSearch = {}
  ): Promise<RealtimeDocumentSearchResult> {
    // eslint-disable-next-line dot-notation
    return this.sdk.document['_search'](index, collection, searchBody, options)
      .then(({ response, request, opts }) => {
        const result = new RealtimeDocumentSearchResult(
          this.sdk,
          request,
          opts,
          response.result,
          this);

        return result.start();
      });
  }

  /**
   * Retrieve a realtime document from a document
   *
   * @param index Index name
   * @param collection Collection name
   * @param document Document to observe
   *
   * @returns A realtime document
   */
  observe (
    index: string,
    collection: string,
    document: Document,
  ): Promise<RealtimeDocument> {
    const rtDocument = this.addDocument(index, collection, document);

    return this.watchCollection(index, collection)
      .then(() => rtDocument);
  }

  /**
   * Adds a document and retrieve managed realtime document
   *
   * @internal
   *
   * Use observe() to retrieve a realtime document.
   */
  addDocument (index: string, collection: string, document: Document): RealtimeDocument {
    const rtDocument = new RealtimeDocument(document);

    const urn = collectionUrn(index, collection);

    if (! this.documentsByCollection.has(urn)) {
      this.documentsByCollection.set(urn, new ObservedDocuments(index, collection));
    }

    const observedDocuments = this.documentsByCollection.get(urn);

    observedDocuments.add(document._id);

    this.documents.set(documentUrn(index, collection, document._id), rtDocument);

    return rtDocument;
  }

  /**
   * Start subscription or pulling on the collection
   *
   * @internal
   */
  watchCollection (index: string, collection: string) {
    return this.mode === 'realtime'
      ? this.resubscribe(index, collection)
      : this.startPulling();
  }

  private startPulling (): Promise<void> {
    return this.clearPullingTimer()
      .then(() => {
        if (this.documentsByCollection.size !== 0) {
          this.pullingTimer = setInterval(
            this.pullingHandler.bind(this),
            this.options.pullingDelay);
        }
      });
  }

  /**
   * Use the document.mGet method to pull documents from observed collections
   * and update internal realtime documents.
   *
   * This method never returns a rejected promise.
   */
  private pullingHandler (): Promise<void> {
    const promises = [];

    for (const observedDocuments of this.documentsByCollection.values()) {
      const promise = this.sdk.document.mGet(
        observedDocuments.index,
        observedDocuments.collection,
        observedDocuments.ids
      )
        .then(({ successes, errors }) => {
          for (const document of successes) {
            const urn = documentUrn(
              observedDocuments.index,
              observedDocuments.collection,
              document._id);

            const rtDocument = this.documents.get(urn);
            Object.assign(rtDocument._source, document._source);
          }

          for (const deletedDocumentId of errors) {
            const urn = documentUrn(
              observedDocuments.index,
              observedDocuments.collection,
              deletedDocumentId);

            const rtDocument = this.documents.get(urn);

            rtDocument.deleted = true;

            this.documents.delete(urn);

            observedDocuments.delete(deletedDocumentId);

            if (observedDocuments.size === 0) {
              this.documentsByCollection.delete(collectionUrn(observedDocuments.index, observedDocuments.collection));
            }
          }
        })
        .catch(() => {
          // A `queryError` event is already emitted by the protocol
          // This handler ensure we don't have any unhandledRejection error
        });

      promises.push(promise)
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return Promise.all(promises).then(() => {}).catch(() => {});
  }

  private clearPullingTimer (): Promise<void> {
    if (this.pullingTimer) {
      clearInterval(this.pullingTimer);
    }

    return Promise.resolve();
  }

  /**
   * Renew a collection subscription with filters according to the list of
   * currently managed documents.
   *
   * @internal
   */
  private resubscribe (index: string, collection: string): Promise<void> {
    const observedDocuments = this.documentsByCollection.get(collectionUrn(index, collection));

    if (! observedDocuments) {
      return Promise.resolve();
    }

    // Do not resubscribe if there is no documents
    if (observedDocuments.size === 0) {
      return observedDocuments.roomId
        ? this.sdk.realtime.unsubscribe(observedDocuments.roomId)
        : Promise.resolve();
    }

    return this.sdk.realtime.subscribe(
      index,
      collection,
      observedDocuments.filters,
      this.notificationHandler.bind(this)
    )
      .then(roomId => {
        const oldRoomId = observedDocuments.roomId;

        observedDocuments.roomId = roomId;

        if (oldRoomId) {
          return this.sdk.realtime.unsubscribe(oldRoomId);
        }
      });
  }

  /**
   * Handler method to process notifications and update realtime documents content.
   *
   * @internal
   */
  private notificationHandler (notification: DocumentNotification): Promise<void> {
    const { index, collection, result } = notification;

    const urn = documentUrn(index, collection, result._id);
    const rtDocument = this.documents.get(urn);

    // On "write", mutate document with changes
    // On "publish", nothing
    if (notification.event !== 'delete') {
      if (notification.event === 'write') {
        Object.assign(rtDocument._source, result._source);
      }

      return Promise.resolve();
    }

    rtDocument.deleted = true;

    this.documents.delete(documentUrn(index, collection, rtDocument._id));

    const observedDocuments = this.documentsByCollection.get(collectionUrn(index, collection));
    observedDocuments.delete(result._id);

    if (observedDocuments.size === 0) {
      this.documentsByCollection.delete(collectionUrn(index, collection));
    }

    return this.resubscribe(index, collection);
  }
}
