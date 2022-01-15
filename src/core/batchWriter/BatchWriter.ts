import { Kuzzle } from '../../Kuzzle';
import { JSONObject } from '../../types';
import { InstrumentablePromise } from './InstrumentablePromise';

export type DocumentsBuffer = {
  documents: Array<{ _id: string, body: JSONObject }>,
  promise: InstrumentablePromise,
  options: JSONObject,
};

/**
 * Map of index and collections with documents, options and associated promise
 *
 * Map<index, Map<collection, DocumentsBuffer>>
 */
export type IndexBuffer = Map<string, Map<string, DocumentsBuffer>>;

export class BatchBuffer {
  public indexes: IndexBuffer = new Map<string, Map<string, DocumentsBuffer>>();

  /**
   * Add a document to the buffer of a specific collection
   *
   * @param index Index name
   * @param collection Collection name
   * @param body Document content
   * @param _id Document ID
   * @param options Option object passed to the m* action
   *
   * @returns An object containing the result index in the array of results and a promise resolving to the array of results
   */
  add (
    index: string,
    collection: string,
    body: JSONObject,
    _id?: string,
    options?: JSONObject
  ): { idx: number, promise: InstrumentablePromise } {
    if (! this.indexes.has(index)) {
      this.indexes.set(index, new Map<string, DocumentsBuffer>());
    }

    if (! this.indexes.get(index).has(collection)) {
      this.indexes.get(index).set(collection, {
        documents: [],
        promise: new InstrumentablePromise(),
        options,
      });
    }

    const buffer = this.indexes.get(index).get(collection);

    const idx = buffer.documents.length;

    buffer.options = { ...buffer.options, ...options };

    buffer.documents.push({ _id, body });

    return {
      idx,
      promise: buffer.promise,
    };
  }
}

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

    this.begin();
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
  }

  /**
   * Reset all the buffers
   */
  private prepareRound () {
    for (const name of Object.keys(this.buffers)) {
      this.buffers[name] = new BatchBuffer();
    }
  }

  private async sendCreateBuffer (buffer: BatchBuffer, options?: { refresh?: 'wait_for' }) {
    const promises = [];

    for (const [index, collectionBuffer] of buffer.indexes.entries()) {
      for (const [collection, { promise, documents }] of collectionBuffer.entries()) {
        if (documents.length === 0) {
          promise.resolve();
          continue;
        }

        promises.push(
          this.sdk.document.mCreate(index, collection, documents as any, { ...options })
            .then(promise.resolve)
            .catch(promise.reject)
        );
      }
    }

    await Promise.all(promises);
  }

  private async sendUpdateBuffer (buffer: BatchBuffer, options?: { refresh?: 'wait_for' }) {
    const promises = [];

    for (const [index, collectionBuffer] of buffer.indexes.entries()) {
      for (const [collection, { promise, documents }] of collectionBuffer.entries()) {
        if (documents.length === 0) {
          promise.resolve();
          continue;
        }

        promises.push(
          this.sdk.document.mUpdate(index, collection, documents as any, { ...options })
            .then(promise.resolve)
            .catch(promise.reject)
        );
      }
    }

    await Promise.all(promises);
  }

  private async sendReplaceBuffer (buffer: BatchBuffer, options?: { refresh?: 'wait_for' }) {
    const promises = [];

    for (const [index, collectionBuffer] of buffer.indexes.entries()) {
      for (const [collection, { promise, documents }] of collectionBuffer.entries()) {
        if (documents.length === 0) {
          promise.resolve();
          continue;
        }

        promises.push(
          this.sdk.document.mReplace(index, collection, documents as any, { ...options })
            .then(promise.resolve)
            .catch(promise.reject)
        );
      }
    }

    await Promise.all(promises);
  }

  private async sendCreateOrReplaceBuffer (buffer: BatchBuffer, options?: { refresh?: 'wait_for' }) {
    const promises = [];

    for (const [index, collectionBuffer] of buffer.indexes.entries()) {
      for (const [collection, { promise, documents }] of collectionBuffer.entries()) {
        if (documents.length === 0) {
          promise.resolve();
          continue;
        }

        promises.push(
          this.sdk.document.mCreateOrReplace(index, collection, documents as any, { ...options })
            .then(promise.resolve)
            .catch(promise.reject)
        );
      }
    }

    await Promise.all(promises);
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
              const exists = new Array(ids.length);

              for (let i = 0; i < exists.length; i++) {
                exists[i] = successesId.includes(ids[i]);
              }

              promise.resolve({ successes: exists });
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
