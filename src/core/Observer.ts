import { Kuzzle } from '../Kuzzle';
import { RealtimeDocument } from './RealtimeDocument';
import { Document, DocumentNotification, JSONObject } from '../types';
import { RealtimeDocumentSearchResult } from './searchResult/RealtimeDocument';

class CollectionSubscription extends Set<string> {
  public roomId: string = null;

  get filters () {
    return {
      ids: { values: Array.from(this.values()) }
    };
  }
}

type DocumentUrn = string;
type CollectionUrn = string;

function documentUrn (index: string, collection: string, id: string): DocumentUrn {
  return `${index}:${collection}:${id}`;
}

function collectionUrn (index: string, collection: string): CollectionUrn {
  return `${index}:${collection}`;
}

export class Observer {
  private collections = new Map<CollectionUrn, CollectionSubscription>();
  private documents = new Map<DocumentUrn, RealtimeDocument>();
  private sdk: Kuzzle;

  constructor (sdk: Kuzzle) {
    this.sdk = sdk;
  }

  stop (index: string, collection: string, documents?: Array<{ _id: string }>) {
    const subscription = this.collections.get(collectionUrn(index, collection));

    if (! documents) {
      for (const documentId of subscription.values()) {
        this.documents.delete(documentUrn(index, collection, documentId));
      }

      this.collections.delete(collectionUrn(index, collection))

      return this.sdk.realtime.unsubscribe(subscription.roomId);
    }

    for (const document of documents) {
      const urn = documentUrn(index, collection, document._id);
      const rtDocument = this.documents.get(urn);

      if (! rtDocument) {
        continue;
      }

      subscription.delete(document._id);
    }

    return this.resubscribe(index, collection);
  }

  dispose () {
    const promises = [];

    for (const subscription of this.collections.values()) {
      if (subscription.roomId) {
        promises.push(this.sdk.realtime.unsubscribe(subscription.roomId));
      }
    }

    this.collections.clear();
    this.documents.clear();

    return Promise.all(promises);
  }

  /**
   * Gets a realtime document
   *
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   *
   * @returns The realtime document
   */
  get (index: string, collection: string, id: string): Promise<RealtimeDocument> {
    return this.sdk.document.get(index, collection, id)
      .then(document => this.observe(index, collection, document));
  }

  /**
   *
   * Gets multiple realtime documents.
   *
   * @param index Index name
   * @param collection Collection name
   * @param ids Document IDs
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mGet (
    index: string,
    collection: string,
    ids: string[]
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

    return this.sdk.document.mGet(index, collection, ids)
      .then(({ successes, errors }) => {
        _errors = errors;

        for (const document of successes) {
          rtDocuments.push(this.addDocument(index, collection, document));
        }

        return this.resubscribe(index, collection);
      })
      .then(() => ({ successes: rtDocuments, errors: _errors }));
  }

  search (
    index: string,
    collection: string,
    searchBody: JSONObject = {},
    options: {
      from?: number;
      size?: number;
      scroll?: string;
      lang?: string;
      verb?: string;
      timeout?: number;
    } = {}
  ): Promise<RealtimeDocumentSearchResult> {
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

  observe (
    index: string,
    collection: string,
    document: Document,
  ): Promise<RealtimeDocument> {
    const rtDocument = this.addDocument(index, collection, document);

    return this.resubscribe(index, collection)
      .then(() => rtDocument);
  }

  addDocument (index: string, collection: string, document: Document): RealtimeDocument {
    const rtDocument = new RealtimeDocument(document);

    const urn = collectionUrn(index, collection);

    if (! this.collections.has(urn)) {
      this.collections.set(urn, new CollectionSubscription());
    }

    const subscription = this.collections.get(urn);

    subscription.add(document._id);

    this.documents.set(documentUrn(index, collection, document._id), rtDocument);

    return rtDocument;
  }

  resubscribe (index: string, collection: string) {
    let _roomId;

    const subscription = this.collections.get(collectionUrn(index, collection));

    return this.sdk.realtime.subscribe(
      index,
      collection,
      subscription.filters,
      this.notificationHandler.bind(this)
    )
      .then(roomId => {
        _roomId = roomId;

        if (subscription.roomId) {
          return this.sdk.realtime.unsubscribe(subscription.roomId);
        }

        return null;
      })
      .then(() => {
        subscription.roomId = _roomId;
      });
  }

  private notificationHandler (notification: DocumentNotification) {
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
    this.documents.delete(rtDocument._id);

    return this.resubscribe(index, collection);
  }
}
