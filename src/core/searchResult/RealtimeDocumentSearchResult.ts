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
  private _mutate: boolean;
  private handlerIndex: number;

  hits: Array<RealtimeDocument>;

  constructor (
    kuzzle: Kuzzle,
    request: RequestPayload,
    options: JSONObject,
    result: JSONObject,
    realtimeDocumentsHandlers: RealtimeDocumentsHandler[],
    mutate: boolean,
  ) {
    if (request.aggs || request.aggregations) {
      throw new Error('Aggregations are not supported for realtimeDocuments');
    }

    super(kuzzle, request, options, result);

    this.realtimeDocumentsHandlers = realtimeDocumentsHandlers;
    this.handlerIndex = this.realtimeDocumentsHandlers.length - 1;
    this._mutate = mutate;

    this.eventEmitter = new KuzzleEventEmitter();

    const hits = this.hits;
    this.hits = [];

    this.hits = hits.map(document => {
      const realtimeDocument = new RealtimeDocument(document, { mutate });

      realtimeDocument.on('updated', changes => {
        this.emit('updated', realtimeDocument._id, changes);
      });

      realtimeDocument.on('deleted', () => {
        this.emit('deleted', realtimeDocument._id);
      });

      return realtimeDocument;
    });

    this.realtimeDocumentsHandlers.push(
      new RealtimeDocumentsHandler(
        kuzzle,
        request.index,
        request.collection,
        this.hits));
  }

  set mutate (value) {
    this._mutate = value;
    this.hits.forEach(realtimeDocument => realtimeDocument.mutate = value);
  }

  get mutate () {
    return this._mutate;
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
      this._mutate);

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
