import { JSONObject } from './JSONObject';

export type MappingsProperties = {
  /**
   * Properties types definition
   *
   * @see https://docs.kuzzle.io/core/2/guides/essentials/database-mappings/#properties-types-definition
   */
  properties?: MappingsProperties,
  /**
   * Dynamic mapping policy
   *
   * @see https://docs.kuzzle.io/core/2/guides/essentials/database-mappings/#dynamic-mapping-policy
   */
  dynamic?: 'true' | 'false' | 'strict'
}

/**
 * Collection mappings definition
 *
 * @see https://docs.kuzzle.io/core/2/guides/essentials/database-mappings/
 */
export type CollectionMappings = {
  /**
   * Collection metadata
   *
   * @see https://docs.kuzzle.io/core/2/guides/essentials/database-mappings/#collection-metadata
   */
  _meta?: JSONObject;
  /**
   * Properties types definition
   *
   * @see https://docs.kuzzle.io/core/2/guides/essentials/database-mappings/#properties-types-definition
   */
  properties?: MappingsProperties,
  /**
   * Dynamic mapping policy
   *
   * @see https://docs.kuzzle.io/core/2/guides/essentials/database-mappings/#dynamic-mapping-policy
   */
  dynamic?: 'true' | 'false' | 'strict',
}
