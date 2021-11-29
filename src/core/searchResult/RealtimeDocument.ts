import { SearchResultBase } from './SearchResultBase';
import { DocumentHit } from '../../types';
import { Observer } from '../Observer';

export class RealtimeDocumentSearchResult extends SearchResultBase<DocumentHit> {
  private observer: Observer;

  /**
   * @param {Kuzzle} kuzzle
   * @param {object} request
   * @param {object} options
   * @param {object} result
   */
  constructor (kuzzle, request, options, result, observer: Observer) {
    super(kuzzle, request, options, result);

    this._searchAction = 'search';
    this._scrollAction = 'scroll';

    this.observer = observer;
  }

  protected _buildNextSearchResult (result: RealtimeDocumentSearchResult) {
    const { index, collection } = this._request;

    const nextSearchResult = new RealtimeDocumentSearchResult(
      this._kuzzle,
      this._request,
      this._options,
      result,
      this.observer);

    nextSearchResult.fetched += this.fetched;

    const rtDocuments = [];
    for (const hit of nextSearchResult.hits) {
      rtDocuments.push(this.observer.addDocument(index, collection, hit));
    }
    nextSearchResult.hits = rtDocuments;

    return this.observer.resubscribe(index, collection)
      .then(() => nextSearchResult);
  }
}
