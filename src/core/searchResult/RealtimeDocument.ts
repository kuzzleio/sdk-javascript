import { SearchResultBase } from './SearchResultBase';
import { DocumentHit } from '../../types';
import { Observer } from '../Observer';

export class RealtimeDocumentSearchResult extends SearchResultBase<DocumentHit> {
  private observer: Observer;

  constructor (kuzzle, request, options, result, observer: Observer) {
    super(kuzzle, request, options, result);

    this._searchAction = 'search';
    this._scrollAction = 'scroll';

    Reflect.defineProperty(this, 'observer', {
      value: observer
    });
  }

  start (): Promise<RealtimeDocumentSearchResult> {
    const { index, collection } = this._request;

    const rtDocuments = [];

    for (const hit of this.hits) {
      rtDocuments.push(this.observer.addDocument(index, collection, hit));
    }

    this.hits = rtDocuments;

    return this.observer.resubscribe(index, collection)
      .then(() => this);
  }

  next (): Promise<RealtimeDocumentSearchResult> {
    return super.next() as any;
  }

  protected _buildNextSearchResult (result: RealtimeDocumentSearchResult) {
    const nextSearchResult = new RealtimeDocumentSearchResult(
      this._kuzzle,
      this._request,
      this._options,
      result,
      this.observer);

    nextSearchResult.fetched += this.fetched;

    return this.start();
  }
}
