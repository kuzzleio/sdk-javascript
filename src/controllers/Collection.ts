import { SpecificationsSearchResult } from "../core/searchResult/Specifications";
import { ArgsDefault, CollectionMappings, JSONObject } from "../types";
import { BaseController } from "./Base";

export class CollectionController extends BaseController {
  constructor(kuzzle) {
    super(kuzzle, "collection");
  }

  /**
   * Creates a new collection in the provided index.
   * You can also provide optional mappings and settings that allow you to exploit
   * the full capabilities of our persistent data storage layer.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/create/
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage
   *
   * @param index Index name
   * @param collection Collection name
   * @param definition Collection mappings and settings
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  create(
    index: string,
    collection: string,
    definition:
      | {
          /**
           * Mappings definition
           */
          mappings?: CollectionMappings;
          /**
           * Elasticsearch index settings
           */
          settings?: JSONObject;
        }
      | CollectionMappings,
    options: ArgsCollectionControllerCreate = {}
  ): Promise<void> {
    const request = {
      action: "create",
      body: definition,
      collection,
      index,
    };

    return this.query(request, options).then(() => undefined);
  }

  /**
   * Deletes validation specifications for a collection.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/delete-specifications/
   *
   * @param index Index name
   * @param collection Collection name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  deleteSpecifications(
    index: string,
    collection: string,
    options: ArgsCollectionControllerDeleteSpecifications = {}
  ): Promise<void> {
    const request = {
      action: "deleteSpecifications",
      collection,
      index,
    };
    return this.query(request, options).then(() => undefined);
  }

  /**
   * Checks if a collection exists in Kuzzle.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/exists/
   *
   * @param index Index name
   * @param collection Collection name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  exists(
    index: string,
    collection: string,
    options: ArgsCollectionControllerExists = {}
  ): Promise<boolean> {
    return this.query(
      {
        action: "exists",
        collection,
        index,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Refreshes a collection to reindex the writed and deleted documents
   * so they are available in search results.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/refresh/
   *
   * @param index Index name
   * @param collection Collection name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  refresh(
    index: string,
    collection: string,
    options: ArgsCollectionControllerRefresh = {}
  ): Promise<void> {
    return this.query(
      {
        action: "refresh",
        collection,
        index,
      },
      options
    ).then(() => undefined);
  }

  /**
   * Returns the collection mapping.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/get-mapping/
   *
   * @param index Index name
   * @param collection Collection name
   * @param options Additional options
   *    - `includeKuzzleMeta` If true, the returned mappings will contain Kuzzle metadata
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  getMapping(
    index: string,
    collection: string,
    options: ArgsCollectionControllerGetMapping = {}
  ): Promise<CollectionMappings> {
    const request = {
      action: "getMapping",
      collection,
      includeKuzzleMeta: options.includeKuzzleMeta || false,
      index,
    };

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Returns the validation specifications associated to the given index and collection.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/get-specifications/
   *
   * @param index Index name
   * @param collection Collection name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The specifications
   */
  getSpecifications(
    index: string,
    collection: string,
    options: ArgsCollectionControllerGetSpecifications = {}
  ): Promise<JSONObject> {
    return this.query(
      {
        action: "getSpecifications",
        collection,
        index,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Returns the list of collections associated to a provided index.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/list/
   *
   * @param index Index name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns An object containing the collection list
   */
  list(
    index: string,
    options: ArgsCollectionControllerList = {}
  ): Promise<{
    /**
     *  Types of returned collections.
     */
    type: string;
    /**
     * List of collections
     */
    collections: Array<{
      /**
       * Collection name
       */
      name: string;
      /**
       * Collection type
       */
      type: "realtime" | "stored";
    }>;
  }> {
    const request = {
      action: "list",
      from: options.from,
      index,
      size: options.size || 0,
    };

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Searches collection specifications.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/search-specifications/
   *
   * @param query Search query
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `from` Offset of the first document to fetch
   *    - `size` Maximum number of documents to retrieve per page
   *    - `scroll` When set, gets a forward-only cursor having its ttl set to the given value (e.g. `30s`)
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  searchSpecifications(
    query: JSONObject = {},
    options: ArgsCollectionControllerSearchSpecifications = {}
  ): Promise<SpecificationsSearchResult> {
    const request = {
      action: "searchSpecifications",
      body: query,
    };

    for (const opt of ["from", "size", "scroll"]) {
      request[opt] = options[opt];
    }

    return this.query(request, options).then(
      (response) =>
        new SpecificationsSearchResult(
          this.kuzzle,
          request,
          options,
          response.result
        )
    );
  }

  /**
   * Removes all documents from a collection, while keeping the associated mappings.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/truncate/
   *
   * @param index Index name
   * @param collection Collection name
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  truncate(
    index: string,
    collection: string,
    options: ArgsCollectionControllerTruncate = {}
  ): Promise<void> {
    const request = {
      action: "truncate",
      collection,
      index,
    };
    return this.query(request, options).then(() => undefined);
  }

  /**
   * Updates a collection informations
   * You can also provide optional mappings and settings that allow you to exploit
   * the full capabilities of our persistent data storage layer.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/update/
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage
   *
   * @param index Index name
   * @param collection Collection name
   * @param definition Collection mappings and settings
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  update(
    index: string,
    collection: string,
    definition:
      | {
          /**
           * Mappings definition
           */
          mappings?: CollectionMappings;
          /**
           * If true, reindex the collection
           */
          reindexCollection?: boolean;
          /**
           * Elasticsearch index settings
           */
          settings?: JSONObject;
        }
      | CollectionMappings,
    options: ArgsCollectionControllerUpdate = {}
  ): Promise<void> {
    return this.query(
      {
        action: "update",
        body: definition,
        collection,
        index,
      },
      options
    ).then(() => undefined);
  }

  /**
   * @deprecated Use collection.update instead
   */
  updateMapping(
    index: string,
    collection: string,
    mappings: CollectionMappings,
    options: ArgsCollectionControllerUpdateMapping = {}
  ): Promise<JSONObject> {
    return this.query(
      {
        action: "updateMapping",
        body: mappings,
        collection,
        index,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Create or updates the validation specifications for a collection.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/update-specifications/
   *
   * @param index Index name
   * @param collection Collection name
   * @param specifications Specifications to update
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns The updated specifications
   */
  updateSpecifications(
    index: string,
    collection: string,
    specifications: JSONObject,
    options: ArgsCollectionControllerUpdateSpecifications = {}
  ): Promise<JSONObject> {
    return this.query(
      {
        action: "updateSpecifications",
        body: specifications,
        collection,
        index,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Checks if a validation specification is well formatted.
   * It does not store or modify the existing specification.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/validate-specifications/
   *
   * @param index Index name
   * @param collection Collection name
   * @param specifications Specifications to validate
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *
   * @returns An object which contain information about the specifications validity.
   */
  validateSpecifications(
    index: string,
    collection: string,
    specifications: JSONObject,
    options: ArgsCollectionControllerValidateSpecifications = {}
  ): Promise<{
    valid: boolean;
    details: Array<string>;
    description: string;
  }> {
    return this.query(
      {
        action: "validateSpecifications",
        body: specifications,
        collection,
        index,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Deletes a collection.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/collection/delete/
   *
   * @param index Index name
   * @param collection Collection name
   * @param options Additional options
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   */
  delete(
    index: string,
    collection: string,
    options: ArgsCollectionControllerDelete = {}
  ): Promise<void> {
    const request = {
      action: "delete",
      collection,
      index,
    };

    return this.query(request, options).then(() => undefined);
  }
}

export type ArgsCollectionControllerCreate = ArgsDefault;

export type ArgsCollectionControllerDeleteSpecifications = ArgsDefault;

export type ArgsCollectionControllerExists = ArgsDefault;

export type ArgsCollectionControllerRefresh = ArgsDefault;

export interface ArgsCollectionControllerGetMapping extends ArgsDefault {
  includeKuzzleMeta?: boolean;
}

export type ArgsCollectionControllerGetSpecifications = ArgsDefault;

export interface ArgsCollectionControllerList extends ArgsDefault {
  from?: number;
  size?: number;
}

export interface ArgsCollectionControllerSearchSpecifications
  extends ArgsDefault {
  from?: number;
  size?: number;
  scroll?: string;
}

export type ArgsCollectionControllerTruncate = ArgsDefault;

export type ArgsCollectionControllerUpdate = ArgsDefault;

export type ArgsCollectionControllerUpdateMapping = ArgsDefault;

export type ArgsCollectionControllerUpdateSpecifications = ArgsDefault;

export type ArgsCollectionControllerValidateSpecifications = ArgsDefault;

export type ArgsCollectionControllerDelete = ArgsDefault;
