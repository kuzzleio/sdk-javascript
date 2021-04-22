import { BaseController } from './Base';
import { JSONObject } from '../types';

export class IndexController extends BaseController {

  constructor (kuzzle) {
    super(kuzzle, 'index');
  }

  /**
   * Creates a new index
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/index/create/
   *
   * @param index Index name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  create (
    index: string,
    options: {
      queuable?: boolean,
      timeout?: number
    } = {}
  ): Promise<void> {
    const request = {
      index,
      action: 'create'
    };
    return this.query(request, options)
      .then(() => undefined);
  }

  /**
   * Deletes an index
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/index/delete/
   *
   * @param index Index name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  delete (
    index: string,
    options: {
      queuable?: boolean,
      timeout?: number
    } = {}
  ): Promise<void> {
    const request = {
      index,
      action: 'delete'
    };
    return this.query(request, options)
      .then(() => undefined);
  }

  /**
   * Checks if the given index exists.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/index/exists/
   *
   * @param index Index name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  exists (
    index: string,
    options: {
      queuable?: boolean,
      timeout?: number
    } = {}
  ): Promise<boolean> {
    return this.query({
      index,
      action : 'exists'
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns the complete list of indexes.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/index/list/
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  list (
    options: {
      queuable?: boolean,
      timeout?: number
    } = {}
  ): Promise<Array<string>> {
    return this.query({
      action: 'list'
    }, options)
      .then(response => response.result.indexes);
  }

  /**
   * Deletes multiple indexes
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/index/m-delete/
   *
   * @param indexes List of index names to delete
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns Names of successfully deleted indexes
   */
  mDelete (
    indexes: Array<string>,
    options: {
      queuable?: boolean,
      timeout?: number
    } = {}
  ): Promise<Array<string>> {
    const request = {
      action: 'mDelete',
      body: {
        indexes
      }
    };

    return this.query(request, options)
      .then(response => response.result.deleted);
  }

  /**
   * Returns detailed storage usage statistics.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/index/stats/
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  stats (
    options: {
      queuable?: boolean,
      timeout?: number
    } = {}
  ): Promise<JSONObject> {
    return this.query({
      action: 'stats'
    }, options)
      .then(response => response.result);
  }
}
