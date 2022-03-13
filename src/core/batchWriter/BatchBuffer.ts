import { JSONObject } from '../../types';
import { InstrumentablePromise } from '../InstrumentablePromise';

/**
 * @internal
 */
export type DocumentsBuffer = {
  documents: Array<{ _id: string, body: JSONObject }>,
  promise: InstrumentablePromise,
  options: JSONObject,
};

/**
 * Map of index and collections with documents, options and associated promise
 *
 * Map<index, Map<collection, DocumentsBuffer>>
 *
 * @internal
 */
export type IndexBuffer = Map<string, Map<string, DocumentsBuffer>>;

/**
 * @internal
 */
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
    options?: JSONObject,
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
