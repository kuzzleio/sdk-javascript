import { DocumentSearchResult } from './Document';
import { KuzzleEventEmitter } from '../KuzzleEventEmitter';
import { Observer } from '../Observer';
import { Kuzzle } from '../../Kuzzle';
import { RequestPayload } from '../../types/RequestPayload';
import { ResponsePayload } from '../../types/ResponsePayload';
import { JSONObject } from '../../types';
import { ObserversHandler } from '../ObserversHandler';

export class ObserverSearchResult extends DocumentSearchResult {
  private eventEmitter: KuzzleEventEmitter;
  private observersHandlers: ObserversHandler[];
  private _notifyOnly: boolean;

  hits: Array<Observer>;

  constructor (
    kuzzle: Kuzzle,
    request: RequestPayload,
    options: JSONObject,
    result: JSONObject,
    observersHandlers: ObserversHandler[],
    notifyOnly: boolean,
  ) {
    if (request.aggs || request.aggregations) {
      throw new Error('Aggregations are not supported for observers');
    }

    super(kuzzle, request, options, result);

    this.observersHandlers = observersHandlers;
    this._notifyOnly = notifyOnly;

    this.eventEmitter = new KuzzleEventEmitter();

    const hits = this.hits;
    this.hits = [];

    this.hits = hits.map(document => {
      const observer = new Observer(document, { notifyOnly });

      observer.on('change', changes => {
        this.emit('change', observer._id, changes);
      });

      observer.on('delete', () => {
        this.emit('delete', observer._id,);
      });

      observer.on('error', error => {
        this.emit('error', observer._id, error);
      });

      return observer;
    });

    this.observersHandlers.push(new ObserversHandler(
      kuzzle,
      request.index,
      request.collection,
      this.hits));
  }

  set notifyOnly (value) {
    this.hits.forEach(observer => observer.notifyOnly = value);
  }

  get notifyOnly () {
    return this._notifyOnly;
  }

  next (): Promise<ObserverSearchResult> {
    return super.next() as any;
  }

  /**
   * @internal
   */
  start (): Promise<void> {
    return Promise.all(
      this.observersHandlers.map(observerHandler => observerHandler.start())
    )
    .then(() => {});
  }

  /**
   * @internal
   */
   stop (): Promise<void> {
    return Promise.all(
      this.observersHandlers.map(observerHandler => observerHandler.stop())
    )
    .then(() => {});
  }

  /**
   * @internal
   */
   protected _buildNextSearchResult (result: JSONObject): Promise<ObserverSearchResult> {
    const nextSearchResult = new ObserverSearchResult(
      this._kuzzle,
      this._request,
      this._options,
      result,
      this.observersHandlers,
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
