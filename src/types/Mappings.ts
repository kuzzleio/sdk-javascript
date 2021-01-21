import { JSONObject } from './JSONObject';

export type MappingsProperties = {
  /**
   * Properties types definition
   *
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-properties
   */
  properties?: MappingsProperties | JSONObject,
  /**
   * Dynamic mapping policy
   *
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-policy
   */
  dynamic?: 'true' | 'false' | 'strict'
}

/**
 * Collection mappings definition
 *
 * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#collection-mappings
 */
export type CollectionMappings = {
  /**
   * Collection metadata
   *
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-metadata
   */
  _meta?: JSONObject;
  /**
   * Properties types definition
   *
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-properties
   */
  properties?: MappingsProperties,
  /**
   * Dynamic mapping policy
   *
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-polic
   */
  dynamic?: 'true' | 'false' | 'strict',
}
