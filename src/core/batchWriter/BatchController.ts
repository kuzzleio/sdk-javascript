import { Kuzzle } from '../../Kuzzle';
import {
  ArgsDocumentControllerCreate,
  ArgsDocumentControllerCreateOrReplace,
  ArgsDocumentControllerReplace,
  ArgsDocumentControllerUpdate,
  DocumentController
} from '../../controllers/Document';
import { JSONObject, Document } from '../../types';
import { BatchWriter } from './BatchWriter';
import { omit } from '../../utils/object';
import { KuzzleError } from '../../KuzzleError';

/**
 * Overload of the document controller.
 *
 * This class replace the following methods and will execute them by batch using
 * m* actions:
 *  - create => mCreate
 *  - replace => mReplace
 *  - createOrReplace => mCreateOrReplace
 *  - update => mUpdate
 *  - get => mGet
 *  - exists => mGet
 *  - delete => mDelete
 *
 * The m* actions returns the successes in the same order as in the request so
 * since we have the index of the single document inside the array of documents
 * sent to the action, we can retrieve the corresponding result in the array of
 * results.
 *
 */
export class BatchController extends DocumentController {
  private writer: BatchWriter;

  /**
   * @param sdk Connected SDK
   * @param options.interval Timer interval in ms (10). Actions will be executed every {interval} ms
   * @param options.maxWriteBufferSize Max write buffer size (200). (Should match "limits.documentsWriteCount")
   * @param options.maxReadBufferSize Max read buffer size. (Should match "limits.documentsReadCount")
   */
  constructor (
    sdk: Kuzzle,
    { interval = 10, maxWriteBufferSize = 200, maxReadBufferSize = 200 } = {}
  ) {
    super(sdk);

    this.writer = new BatchWriter(sdk, {
      interval,
      maxWriteBufferSize,
      maxReadBufferSize
    });
  }

  async dispose () {
    await this.writer.dispose();
  }

  async create (
    index: string,
    collection: string,
    content: JSONObject,
    _id?: string,
    options?: ArgsDocumentControllerCreate
  ): Promise<Document> {
    const { idx, promise } = this.writer.addCreate(index, collection, content, _id, options);

    const { successes, errors } = await promise.promise;

    if (errors.length > 0) {
      const error = errors.find(e => {
        const responseDoc = omit(e.document._source, ['_kuzzle_info']);
        const originDoc = content;

        return JSON.stringify(responseDoc) === JSON.stringify(originDoc);
      });

      if (error) {
        throw new Error(`Cannot create document in "${index}":"${collection}" : ${error.reason}`);
      }
    }

    return successes[idx];
  }

  async replace (
    index: string,
    collection: string,
    _id: string,
    content: JSONObject,
    options?: ArgsDocumentControllerReplace
  ): Promise<Document> {
    const { idx, promise } = this.writer.addReplace(index, collection, content, _id, options);

    const { successes, errors } = await promise.promise;

    const error = errors.find(({ _id: id }) => id === _id);

    if (error) {
      throw new Error(`Cannot replace document "${index}":"${collection}":"${_id}": ${error.reason}`);
    }

    return successes[idx];
  }

  async createOrReplace (
    index: string,
    collection: string,
    _id: string,
    content: JSONObject,
    options?: ArgsDocumentControllerCreateOrReplace
  ): Promise<Document> {
    const { idx, promise } = this.writer.addCreateOrReplace(index, collection, content, _id, options);

    const { successes, errors } = await promise.promise;

    const error = errors.find(({ document }) => document._id === _id);

    if (error) {
      throw new Error(`Cannot create or replace document "${index}":"${collection}":"${_id}": ${error.reason}`);
    }

    return successes[idx];
  }

  async update (
    index: string,
    collection: string,
    _id: string,
    content: JSONObject,
    options?: ArgsDocumentControllerUpdate
  ): Promise<Document> {
    const { idx, promise } = this.writer.addUpdate(index, collection, content, _id, options);

    const { successes, errors } = await promise.promise;

    const error = errors.find(({ _id: id }) => id === _id);

    if (error) {
      throw new Error(`Cannot update document "${index}":"${collection}":"${_id}": ${error.reason}`);
    }

    return successes[idx];
  }

  async get (index: string, collection: string, id: string): Promise<Document> {
    const { promise } = this.writer.addGet(index, collection, undefined, id);

    const { successes } = await promise.promise;

    const document = successes.find(({ _id }) => _id === id);

    if (! document) {
      throw new KuzzleError({
        message: `Document "${index}":"${collection}":"${id}" not found`,
        id: 'services.storage.not_found',
      });
    }

    return document;
  }

  async exists (index: string, collection: string, id: string): Promise<boolean> {
    const { idx, promise } = this.writer.addExists(index, collection, undefined, id);

    const { successes } = await promise.promise;

    return successes[idx];
  }

  async delete (index: string, collection: string, id: string): Promise<string> {
    const { idx, promise } = this.writer.addDelete(index, collection, undefined, id);

    const { successes, errors } = await promise.promise;

    const error = errors.find(({ _id }) => _id === id);

    if (error) {
      throw new Error(`Cannot delete document "${index}":"${collection}":"${id}" : ${error.reason}`);
    }

    return successes[idx];
  }
}
