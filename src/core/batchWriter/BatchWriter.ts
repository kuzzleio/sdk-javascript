import { Kuzzle } from '../../Kuzzle';
import { JSONObject } from '../../types';
import { BatchBuffer } from './BatchBuffer';

/**
 * This class handle buffers for every supported API action of the document controller:
 *  - create, update, createOrReplace, replace, get, exists, delete
 *
 * Each buffer is filled with documents to be write/get/delete into a collection.
 *
 * A timer will regularly execute the m* actions with the documents inside the buffers.
 *
 * If the interval is too big, buffers may contain too much documents for Kuzzle limits.
 * (e.g. "limits.documentsWriteCount" is 200 by default)
 *
 * @internal
 */
export class BatchWriter {
  private timer: any;
  private sdk: Kuzzle;

  /**
   * Timer interval to execute m* API actions
   */
  private interval: number;

  /**
   * Max write buffer size. (Should match "limits.documentsWriteCount")
   */
  private maxWriteBufferSize: number;

  /**
   * Max read buffer size. (Should match "limits.documentsReadCount")
   */
  private maxReadBufferSize: number;

  // Buffers
  private buffers = {
    create: new BatchBuffer(),
    update: new BatchBuffer(),
    get: new BatchBuffer(),
    exists: new BatchBuffer(),
    delete: new BatchBuffer(),
    replace: new BatchBuffer(),
    createOrReplace: new BatchBuffer(),
  };

  get addCreate () {
    // @todo implements the send of buffer if approaching the limit
    return this.buffers.create.add.bind(this.buffers.create);
  }

  get addUpdate () {
    return this.buffers.update.add.bind(this.buffers.update);
  }

  get addGet () {
    return this.buffers.get.add.bind(this.buffers.get);
  }

  get addExists () {
    return this.buffers.exists.add.bind(this.buffers.exists);
  }

  get addDelete () {
    return this.buffers.delete.add.bind(this.buffers.delete);
  }

  get addReplace () {
    return this.buffers.replace.add.bind(this.buffers.replace);
  }

  get addCreateOrReplace () {
    return this.buffers.createOrReplace.add.bind(this.buffers.createOrReplace);
  }

  constructor (
    sdk: Kuzzle,
    { interval = 10, maxWriteBufferSize = 200, maxReadBufferSize = 200 } = {}
  ) {
    this.sdk = sdk;
    this.interval = interval;
    this.maxWriteBufferSize = maxWriteBufferSize;
    this.maxReadBufferSize = maxReadBufferSize;
  }

  /**
   * Execute API actions with documents stored in the buffers.
   */
  async execute () {
    const buffers: JSONObject = {};

    // make a copy of the buffers
    for (const [name, buffer] of Object.entries(this.buffers)) {
      buffers[name] = buffer;
    }

    // prepare to enqueue documents in buffers
    this.prepareRound();

    await Promise.all([
      this.sendCreateBuffer(buffers.create),
      this.sendUpdateBuffer(buffers.update),
      this.sendCreateOrReplaceBuffer(buffers.createOrReplace),
      this.sendDeleteBuffer(buffers.delete),
      this.sendExistsBuffer(buffers.exists),
      this.sendGetBuffer(buffers.get),
      this.sendReplaceBuffer(buffers.replace),
    ]);
  }

  /**
   * Initialize the buffers and start the timer
   */
  begin () {
    this.prepareRound();

    this.timer = setInterval(async () => {
      await this.execute();
    }, this.interval);
  }

  /**
   * Execute pending actions from the buffers and stop the timer.
   */
  async dispose () {
    await this.execute();

    clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Reset all the buffers
   */
  private prepareRound () {
    for (const name of Object.keys(this.buffers)) {
      this.buffers[name] = new BatchBuffer();
    }
  }

  private async sendWriteBuffer (
    mAction: any,
    buffer: BatchBuffer,
    options: JSONObject = {},
  ) {
    const promises = [];

    for (const [index, collectionBuffer] of buffer.indexes.entries()) {
      for (const [collection, { promise, documents }] of collectionBuffer.entries()) {
        if (documents.length === 0) {
          promise.resolve();
          continue;
        }

        promises.push(
          this.sdk.document[mAction](index, collection, documents as any, { ...options })
            .then(promise.resolve)
            .catch(promise.reject)
        );
      }
    }

    await Promise.all(promises);
  }

  private sendCreateBuffer (buffer: BatchBuffer, options?: { refresh?: 'wait_for' }) {
    return this.sendWriteBuffer('mCreate', buffer, options);
  }

  private async sendUpdateBuffer (buffer: BatchBuffer, options?: { refresh?: 'wait_for' }) {
    return this.sendWriteBuffer('mUpdate', buffer, options);
  }

  private async sendReplaceBuffer (buffer: BatchBuffer, options?: { refresh?: 'wait_for' }) {
    return this.sendWriteBuffer('mReplace', buffer, options);
  }

  private async sendCreateOrReplaceBuffer (buffer: BatchBuffer, options?: { refresh?: 'wait_for' }) {
    return this.sendWriteBuffer('mCreateOrReplace', buffer, options);
  }

  private async sendGetBuffer (buffer: BatchBuffer) {
    const promises = [];

    for (const [index, collectionBuffer] of buffer.indexes.entries()) {
      for (const [collection, { promise, documents }] of collectionBuffer.entries()) {
        if (documents.length === 0) {
          promise.resolve();
          continue;
        }

        const ids = documents.map(({ _id }) => _id);

        promises.push(
          this.sdk.document.mGet(index, collection, ids)
            .then(promise.resolve)
            .catch(promise.reject)
        );
      }
    }

    await Promise.all(promises);
  }

  private async sendExistsBuffer (buffer: BatchBuffer) {
    const promises = [];

    for (const [index, collectionBuffer] of buffer.indexes.entries()) {
      for (const [collection, { promise, documents }] of collectionBuffer.entries()) {
        if (documents.length === 0) {
          promise.resolve();
          continue;
        }

        const ids = documents.map(({ _id }) => _id);
        promises.push(
          this.sdk.document.mGet(index, collection, ids)
            .then(({ successes }) => {
              const successesId = successes.map(({ _id }) => _id);
              const existences = new Array(ids.length);

              for (let i = 0; i < existences.length; i++) {
                existences[i] = successesId.includes(ids[i]);
              }

              promise.resolve(existences);
            })
            .catch(promise.reject)
        );
      }
    }

    await Promise.all(promises);
  }

  private async sendDeleteBuffer (buffer: BatchBuffer) {
    const promises = [];

    for (const [index, collectionBuffer] of buffer.indexes.entries()) {
      for (const [collection, { promise, documents }] of collectionBuffer.entries()) {
        if (documents.length === 0) {
          promise.resolve();
          continue;
        }

        const ids = documents.map(({ _id }) => _id);

        promises.push(
          this.sdk.document.mDelete(index, collection, ids)
            .then(promise.resolve)
            .catch(promise.reject)
        );
      }
    }

    await Promise.all(promises);
  }
}
