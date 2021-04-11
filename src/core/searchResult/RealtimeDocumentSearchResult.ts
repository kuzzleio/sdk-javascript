import { DocumentSearchResult } from './Document';
import { KuzzleEventEmitter } from '../KuzzleEventEmitter';
import { RealtimeDocument } from '../RealtimeDocument';
import { Kuzzle } from '../../Kuzzle';
import { RequestPayload } from '../../types/RequestPayload';
import { JSONObject } from '../../types';
import { RealtimeDocumentsHandler } from '../RealtimeDocumentsHandler';

export class RealtimeDocumentSearchResult extends DocumentSearchResult {
  private eventEmitter: KuzzleEventEmitter;
  private realtimeDocumentsHandlers: RealtimeDocumentsHandler[];
  private _notifyOnly: boolean;
  private handlerIndex: number;

  hits: Array<RealtimeDocument>;

  constructor (
    kuzzle: Kuzzle,
    request: RequestPayload,
    options: JSONObject,
    result: JSONObject,
    realtimeDocumentsHandlers: RealtimeDocumentsHandler[],
    notifyOnly: boolean,
  ) {
    if (request.aggs || request.aggregations) {
      throw new Error('Aggregations are not supported for realtimeDocuments');
    }

    super(kuzzle, request, options, result);

    this.realtimeDocumentsHandlers = realtimeDocumentsHandlers;
    this.handlerIndex = this.realtimeDocumentsHandlers.length - 1;
    this._notifyOnly = notifyOnly;

    this.eventEmitter = new KuzzleEventEmitter();

    const hits = this.hits;
    this.hits = [];

    this.hits = hits.map(document => {
      const realtimeDocument = new RealtimeDocument(document, { notifyOnly });

      realtimeDocument.on('change', changes => {
        this.emit('change', realtimeDocument._id, changes);
      });

      realtimeDocument.on('delete', () => {
        this.emit('delete', realtimeDocument._id,);
      });

      realtimeDocument.on('error', error => {
        this.emit('error', realtimeDocument._id, error);
      });

      return realtimeDocument;
    });

    this.realtimeDocumentsHandlers.push(new RealtimeDocumentsHandler(
      kuzzle,
      request.index,
      request.collection,
      this.hits));
  }

  set notifyOnly (value) {
    this.hits.forEach(realtimeDocument => realtimeDocument.notifyOnly = value);
  }

  get notifyOnly () {
    return this._notifyOnly;
  }

  next (): Promise<RealtimeDocumentSearchResult> {
    return super.next() as any;
  }

  start (): Promise<void> {
    return this.realtimeDocumentsHandlers[this.handlerIndex].start();
  }

   stop (): Promise<void> {
    return this.realtimeDocumentsHandlers[this.handlerIndex].stop();
  }

  /**
   * @internal
   */
   protected _buildNextSearchResult (result: JSONObject): Promise<RealtimeDocumentSearchResult> {
    const nextSearchResult = new RealtimeDocumentSearchResult(
      this._kuzzle,
      this._request,
      this._options,
      result,
      this.realtimeDocumentsHandlers,
      this._notifyOnly);

    nextSearchResult.fetched += this.fetched;

    return nextSearchResult.start()
      .then(() => nextSearchResult);
  }

  /**
   * KuzzleEventEmitter bridge
   */
  emit (event, ...args) {
    return this.eventEmitter.emit(event, ...args);
  }

  on (event, listener) {
    return this.eventEmitter.on(event, listener);
  }
}
