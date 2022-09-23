import { Kuzzle } from "../../Kuzzle";
import {
  ArgsDocumentControllerCreate,
  ArgsDocumentControllerCreateOrReplace,
  ArgsDocumentControllerReplace,
  ArgsDocumentControllerUpdate,
  DocumentController,
} from "../../controllers/Document";
import { JSONObject, KDocumentContentGeneric, KDocument } from "../../types";
import { BatchWriter } from "./BatchWriter";
import { omit } from "../../utils/object";
import { KuzzleError } from "../../KuzzleError";

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
 * This will significantly increase performances.
 * The drawback is that standard API errors will not be available. (Except for the `services.storage.not_found` error).
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
  constructor(
    sdk: Kuzzle,
    { interval = 10, maxWriteBufferSize = 200, maxReadBufferSize = 200 } = {}
  ) {
    super(sdk);

    this.writer = this.createWriter(sdk, {
      interval,
      maxReadBufferSize,
      maxWriteBufferSize,
    });

    this.writer.begin();
  }

  /**
   * Dispose the instance.
   *
   * This method has to be called to destroy the underlaying timer sending batch requests.
   */
  async dispose() {
    await this.writer.dispose();
  }

  /**
   * See sdk.document.create method
   *
   * @param index Index name
   * @param collection Collection name
   * @param content Document content
   * @param _id Optional document ID
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The created document
   */
  async create<TKDocumentContent extends KDocumentContentGeneric>(
    index: string,
    collection: string,
    content: Partial<TKDocumentContent>,
    _id?: string,
    options?: ArgsDocumentControllerCreate
  ): Promise<KDocument<TKDocumentContent>> {
    const { idx, promise } = this.writer.addCreate(
      index,
      collection,
      content,
      _id,
      options
    );

    const { successes, errors } = await promise.promise;

    if (errors.length > 0) {
      const error = errors.find((e) => {
        const responseDoc = omit(e.document._source, ["_kuzzle_info"]);
        const originDoc = content;

        return JSON.stringify(responseDoc) === JSON.stringify(originDoc);
      });

      if (error) {
        throw new Error(
          `Cannot create document in "${index}":"${collection}" : ${error.reason}`
        );
      }
    }

    return successes[idx];
  }

  /**
   * See document.replace method
   *
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   * @param content Document content
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The replaced document
   */
  async replace<TKDocumentContent extends KDocumentContentGeneric>(
    index: string,
    collection: string,
    _id: string,
    content: Partial<TKDocumentContent>,
    options?: ArgsDocumentControllerReplace
  ): Promise<KDocument<TKDocumentContent>> {
    const { idx, promise } = this.writer.addReplace(
      index,
      collection,
      content,
      _id,
      options
    );

    const { successes, errors } = await promise.promise;

    const error = errors.find(({ _id: id }) => id === _id);

    if (error) {
      throw new Error(
        `Cannot replace document "${index}":"${collection}":"${_id}": ${error.reason}`
      );
    }

    return successes[idx];
  }

  /**
   * See document.createOrReplace method
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   * @param content Document content
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The created or replaced document
   */
  async createOrReplace<TKDocumentContent extends KDocumentContentGeneric>(
    index: string,
    collection: string,
    _id: string,
    content: Partial<TKDocumentContent>,
    options?: ArgsDocumentControllerCreateOrReplace
  ): Promise<KDocument<TKDocumentContent>> {
    const { idx, promise } = this.writer.addCreateOrReplace(
      index,
      collection,
      content,
      _id,
      options
    );

    const { successes, errors } = await promise.promise;

    const error = errors.find(({ document }) => document._id === _id);

    if (error) {
      throw new Error(
        `Cannot create or replace document "${index}":"${collection}":"${_id}": ${error.reason}`
      );
    }

    return successes[idx];
  }

  /**
   * See document.update method
   *
   * @param index Index name
   * @param collection Collection name
   * @param id Document ID
   * @param content Document content
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.retryOnConflict Number of times the database layer should retry in case of version conflict
   * @param options.source If true, returns the updated document inside the response
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The replaced document
   */
  async update<TKDocumentContent extends KDocumentContentGeneric>(
    index: string,
    collection: string,
    _id: string,
    content: Partial<TKDocumentContent>,
    options?: ArgsDocumentControllerUpdate
  ): Promise<KDocument<TKDocumentContent>> {
    const { idx, promise } = this.writer.addUpdate(
      index,
      collection,
      content,
      _id,
      options
    );

    const { successes, errors } = await promise.promise;

    const error = errors.find(({ _id: id }) => id === _id);

    if (error) {
      throw new Error(
        `Cannot update document "${index}":"${collection}":"${_id}": ${error.reason}`
      );
    }

    return successes[idx];
  }

  /**
   * See document.get method
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The document
   */
  async get<TKDocumentContent extends KDocumentContentGeneric>(
    index: string,
    collection: string,
    id: string
  ): Promise<KDocument<TKDocumentContent>> {
    const { promise } = this.writer.addGet(index, collection, undefined, id);

    const { successes } = await promise.promise;

    const document = successes.find(({ _id }) => _id === id);

    if (!document) {
      throw new KuzzleError({
        id: "services.storage.not_found",
        message: `Document "${index}":"${collection}":"${id}" not found`,
      });
    }

    return document;
  }

  /**
   * See document.exists method
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns True if the document exists
   */
  async exists(
    index: string,
    collection: string,
    id: string
  ): Promise<boolean> {
    const { idx, promise } = this.writer.addExists(
      index,
      collection,
      undefined,
      id
    );

    const existences = await promise.promise;

    return existences[idx];
  }

  /**
   * See document.delete method
   *
   * @param index Index name
   * @param collection Collection name
   * @param _id Document ID
   * @param options Additional options
   * @param options.queuable If true, queues the request during downtime, until connected to Kuzzle again
   * @param options.refresh If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   * @param options.silent If true, then Kuzzle will not generate notifications
   * @param options.timeout Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The document ID
   */
  async delete(index: string, collection: string, id: string): Promise<string> {
    const { idx, promise } = this.writer.addDelete(
      index,
      collection,
      undefined,
      id
    );

    const { successes, errors } = await promise.promise;

    const error = errors.find(({ _id }) => _id === id);

    if (error) {
      throw new Error(
        `Cannot delete document "${index}":"${collection}":"${id}" : ${error.reason}`
      );
    }

    return successes[idx];
  }

  /**
   * Used in function tests.
   * @internal
   */
  private createWriter(sdk: Kuzzle, options: JSONObject) {
    return new BatchWriter(sdk, options);
  }
}
