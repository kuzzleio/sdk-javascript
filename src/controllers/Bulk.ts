import { BaseController } from "./Base";
import { JSONObject, ArgsDefault } from "../types";

export class BulkController extends BaseController {
  constructor(kuzzle) {
    super(kuzzle, "bulk");
  }

  /**
   * Directly deletes every document matching the search query without:
   *  - applying max documents write limit
   *  - fetching deleted documents
   *  - triggering realtime notifications
   *
   * @see https://docs.kuzzle.io/core/2/api/controllers/bulk/delete-by-query/
   *
   * @param index - Index name
   * @param collection - Collection name
   * @param query - Query matching documents to delete
   * @param options - Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   * @returns The number of deleted documents
   */
  deleteByQuery(
    index: string,
    collection: string,
    query: JSONObject = {},
    options: ArgsBulkControllerDeleteByQuery = {}
  ): Promise<number> {
    const request = {
      action: "deleteByQuery",
      body: query,
      collection,
      index,
    };

    return this.query(request, options).then(
      (response) => response.result.deleted
    );
  }

  /**
   * Creates, updates or deletes large amounts of documents as fast as possible.
   *
   * @see https://docs.kuzzle.io/core/2/api/controllers/bulk/import/
   *
   * @param index - Index name
   * @param collection - Collection name
   * @param bulkData - Array of documents detailing the bulk operations to perform, following ElasticSearch Bulk API
   * @param options - Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  import(
    index: string,
    collection: string,
    bulkData: Array<JSONObject>,
    options: ArgsBulkControllerImport = {}
  ): Promise<{
    successes: Array<{
      [actionName: string]: {
        _id: string;
        status: string;
      };
    }>;
    errors: Array<{
      _id: string;
      status: string;
      error: {
        type: string;
        reason: string;
      };
    }>;
  }> {
    return this.query(
      {
        action: "import",
        body: { bulkData },
        collection,
        index,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Updates documents matching the provided search query.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/bulk/update-by-query/
   *
   * @param index Index name
   * @param collection Collection name
   * @param query Query to match
   * @param changes Partial changes to apply to the documents
   * @param options Additional options
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns The number of updated documents
   */
  updateByQuery(
    index: string,
    collection: string,
    query: JSONObject,
    changes: JSONObject,
    options: ArgsBulkControllerUpdateByQuery = {}
  ): Promise<number> {
    const request = {
      action: "updateByQuery",
      body: { changes, query },
      collection,
      index,
    };

    return this.query(request, options).then(
      (response) => response.result.updated
    );
  }

  /**
   * Creates or replaces a document directly into the storage engine.
   *
   * @see https://docs.kuzzle.io/core/2/api/controllers/bulk/write/
   *
   * @param index - Index name
   * @param collection - Collection name
   * @param document- Document body (with the _kuzzle_info metadata)
   * @param id - Optional document ID
   * @param options - Additional options
   *    - `notify` If true, Kuzzle will trigger realtime notifications
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns An object containing the document creation result
   */
  write(
    index: string,
    collection: string,
    document: JSONObject,
    id?: string,
    options: ArgsBulkControllerWrite = {}
  ): Promise<Document> {
    return this.query(
      {
        _id: id,
        action: "write",
        body: document,
        collection,
        index,
        notify: options.notify,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Creates or replaces multiple documents directly into the storage engine.
   *
   * @see https://docs.kuzzle.io/core/2/api/controllers/bulk/m-write/
   *
   * @param index - Index name
   * @param collection - Collection name
   * @param documents - Array of objects describing the documents
   * @param options - Additional options
   *    - `notify` If true, Kuzzle will trigger realtime notifications
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns An object containing 2 arrays: "successes" and "errors"
   */
  mWrite(
    index: string,
    collection: string,
    documents: Array<{
      _id?: string;
      _source: JSONObject;
    }>,
    options: ArgsBulkControllerMWrite = {}
  ): Promise<{
    successes: Array<Document>;
    errors: Array<{
      document: Document;
      status: number;
      reason: string;
    }>;
  }> {
    return this.query(
      {
        action: "mWrite",
        body: { documents },
        collection,
        index,
        notify: options.notify,
      },
      options
    ).then((response) => response.result);
  }
}

export interface ArgsBulkControllerDeleteByQuery extends ArgsDefault {
  refresh?: "wait_for" | "false";
}

export type ArgsBulkControllerImport = ArgsDefault;

export interface ArgsBulkControllerUpdateByQuery extends ArgsDefault {
  refresh?: "wait_for" | "false";
}

export interface ArgsBulkControllerWrite extends ArgsDefault {
  notify?: boolean;
  refresh?: "wait_for" | "false";
}

export interface ArgsBulkControllerMWrite extends ArgsDefault {
  notify?: boolean;
  refresh?: "wait_for" | "false";
}
