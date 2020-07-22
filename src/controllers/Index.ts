import { BaseController } from './Base';

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
   */
  create (index: string, options: { queuable?: boolean } = {}): Promise<void> {
    const request = {
      index,
      action: 'create'
    };
    return this.query(request, options)
      .then(() => {});
  }

  /**
   * Deletes an index
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/index/delete/
   *
   * @param index Index name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   */
  delete (index: string, options: { queuable?: boolean } = {}): Promise<void> {
    const request = {
      index,
      action: 'delete'
    };
    return this.query(request, options)
      .then(() => {});
  }

  /**
   * Checks if the given index exists.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/index/exists/
   *
   * @param index Index name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   */
  exists (index: string, options: { queuable?: boolean } = {}): Promise<boolean> {
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
   */
  list (options: { queuable?: boolean } = {}): Promise<Array<string>> {
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
   *
   * @returns Names of successfully deleted indexes
   */
  mDelete (
    indexes: Array<string>,
    options: { queuable?: boolean } = {}
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
}
