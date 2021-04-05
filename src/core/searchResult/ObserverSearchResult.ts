import { DocumentSearchResult } from './Document';
import { KuzzleEventEmitter } from '../KuzzleEventEmitter';
import { Observer } from '../Observer';
import { Kuzzle } from '../../Kuzzle';
import { RequestPayload } from '../../types/RequestPayload';
import { ResponsePayload } from '../../types/ResponsePayload';
import { JSONObject } from '../../types';

class ObserverSearchResult extends DocumentSearchResult {
  private eventEmitter: KuzzleEventEmitter;

  hits: Array<Observer>;

  constructor (
    kuzzle: Kuzzle,
    request: RequestPayload,
    options: JSONObject,
    response: ResponsePayload
  ) {
    super(kuzzle, request, options, response);

    this.eventEmitter = new KuzzleEventEmitter();

    if (request.aggs || request.aggregations) {
      throw new Error('Aggregations are not supported for observers');
    }

    const hits = this.hits;
    this.hits = [];

    this.hits = hits.map(document => {
      const observer = new Observer(kuzzle, request.index, request.collection, document);

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
  }

  set notifyOnly (value) {
    this.hits.forEach(observer => observer.notifyOnly = value);
  }

  start () {
    return Promise.all(this.hits.map(observer => observer.start()))
      .then(() => this);
  }

  stop () {
    return Promise.all(this.hits.map(observer => observer.stop()))
      .then(() => this);
  }

  _buildNextSearchResult (response) {
    const Constructor: any = this.constructor;

    const nextSearchResult = new Constructor(this._kuzzle, this._request, this._options, response.result);

    nextSearchResult.fetched += this.fetched;

    return nextSearchResult.start();
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

module.exports = ObserverSearchResult;
