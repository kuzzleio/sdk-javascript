import { JSONObject } from './JSONObject';

type PropertyObject = {
  properties?: MappingsProperties;
}

type PropertyDynamic = {
  /**
   * Dynamic mapping policy
   *
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-policy
   */
  dynamic?: 'true' | 'false' | 'strict';
}

type PropertyType = {
  [name: string]: { type?: string; } | PropertyObject | JSONObject
}

export type MappingsProperties = PropertyObject | PropertyDynamic | PropertyType;

/**
 * Collection mappings definition
 *
 * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#collection-mappings
 *
 * @example
 * ```
 * {
 *   properties: {
 *     name: { type: 'keyword' },
 *     address: {
 *       properties: {
 *         zipcode: { type: 'integer' }
 *       }
 *     }
 *   }
 * }
 * ```
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
  properties?: MappingsProperties;

  /**
   * Dynamic mapping policy
   *
   * @see https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-polic
   */
  dynamic?: 'true' | 'false' | 'strict';
}
