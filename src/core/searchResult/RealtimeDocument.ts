import { JSONObject, KDocContentGeneric, KHit } from '../../types';
import { Observer } from '../Observer';
import { Kuzzle } from '../../Kuzzle';
import { RequestPayload } from '../../types/RequestPayload';
import { SearchResultBase } from './SearchResultBase';

/**
 * Represents a SearchResult containing realtime documents.
 */
export class RealtimeDocumentSearchResult<TKDocContent extends KDocContentGeneric> extends SearchResultBase<KHit<TKDocContent>> {
  private observer: Observer;

  constructor (
    kuzzle: Kuzzle,
    request: RequestPayload,
    options: JSONObject,
    result: JSONObject,
    observer: Observer,
  ) {
    super(kuzzle, request, options, result);

    this._searchAction = 'search';
    this._scrollAction = 'scroll';

    Reflect.defineProperty(this, 'observer', {
      value: observer
    });
  }

  /**
   * Start observing documents.
   *
   * This method is called automatically.
   *
   * @internal
   */
  start (): Promise<this> {
    const { index, collection } = this._request;

    const rtDocuments = [];

    for (const hit of this.hits) {
      rtDocuments.push(this.observer.addDocument(index, collection, hit));
    }

    this.hits = rtDocuments;

    return this.observer.watchCollection(index, collection)
      .then(() => this);
  }

  next (): Promise<this> {
    return super.next() as any;
  }

  protected _buildNextSearchResult (result: JSONObject) {
    const nextSearchResult = new RealtimeDocumentSearchResult<TKDocContent>(
      this._kuzzle,
      this._request,
      this._options,
      result,
      this.observer);

    nextSearchResult.fetched += this.fetched;

    return nextSearchResult.start();
  }
}
