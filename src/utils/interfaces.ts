'use strict';

/**
 * An interface representing an object with string key and any value
 */
export interface JSONObject {
  [key: string]: JSONObject | any
}

/**
 * Kuzzle API request
 *
 * @see https://docs.kuzzle.io/core/2/api/essentials/query-syntax/#other-protocols
 */
export interface KuzzleRequest extends JSONObject {
  controller?: string;
  action?: string;
  index?: string;
  collection?: string;
  _id?: string;
  jwt?: string;
  volatile?: JSONObject;
  body?: JSONObject;
  [key: string]: any;
}

/**
 * A profile policy is composed of a roleId to define API rights
 * and an optional array of restrictions on index and collections
 *
 * @example
 * {
 *   "roleId": "editor",
 *   "restrictedTo": {
 *     "index": "blog",
 *     "collections": [
 *       "articles"
 *     ]
 *   }
 * }
 *
 * @see https://docs.kuzzle.io/core/2/guides/essentials/security/#defining-profiles
 */
export interface ProfilePolicy {
  /**
   * Role unique ID used by this policy
   */
  roleId: string;

  /**
   * Optional array of restrictions on which the rights are gonne be applied
   */
  restrictedTo?: {
    /**
     * Index name.
     * Rights will only be applied on this index.
     */
    index: string;

    /**
     * Collection names.
     * Rights will only be applied on those collections.
     */
    collections?: Array<string>;
  }
}

/**
 * Role list of rights definition for controllers and actions.
 *
 * @example
 *
 * {
 *   auth: {
 *     actions: {
 *       getCurrentUser: true,
 *       getMyCredentials: true,
 *       getMyRights: true,
 *       logout: true
 *     }
 *   },
 *   realtime: {
 *     actions: {
 *       "*": true
 *     }
 *   }
 * }
 *
 * @see https://docs.kuzzle.io/core/2/guides/essentials/security#defining-roles
 */
export interface RoleRightsDefinition {
  /**
   * API controller name
   */
  [key: string]: {
    actions: {
      /**
       * API action name
       */
      [key: string]: boolean
    }
  }
}

/**
 * ApiKey
 */
export interface ApiKey {
  /**
   * ApiKey unique ID
   */
  _id: string;
  /**
   * ApiKey content
   */
  _source: {
    /**
     * User kuid
     */
    userId: string;
    /**
     * Expiration date in Epoch-millis format (-1 if the token never expires)
     */
    expiresAt: number;
    /**
     * Original TTL in ms
     */
    ttl: number;
    /**
     * API key description
     */
    description: string;
    /**
     * Authentication token associated with this API key
     */
    token: string;
  }
}

/**
 * Kuzzle document
 *
 * @property _id
 * @property _version
 * @property _source
 */
export interface Document {
  /**
   * Document unique ID
   */
  _id?: string;
  /**
   * Document Version (generated by Elasticsearch)
   */
  _version?: number;
  /**
   * Document Content
   */
  _source?: {
    [key: string]: JSONObject | any,
    /**
     * Kuzzle metadata
     * @see https://docs.kuzzle.io/core/2/guides/essentials/document-metadata/
     */
    _kuzzle_info?: {
      /**
       * Kuid of the user who created the document
       */
      author: string,
      /**
       * Creation date in micro-timestamp
       */
      createdAt: number,
      /**
       * Kuid of the user who last updated the document
       */
      updater: string | null,
      /**
       * Update date in micro-timestamp
       */
      updatedAt: number | null
    }
  };
}

/**
 * Document retrieved from a search
 *
 * @property _id
 * @property _version
 * @property _source
 * @property _score
 */
export interface DocumentHit extends Document {
  /**
   * Relevance score
   */
  _score: number;
}

export interface MappingsProperties {
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
  dynamic?: 'true' | 'false' | 'strict' | boolean
}

/**
 * Collection mappings definition
 *
 * @see https://docs.kuzzle.io/core/2/guides/essentials/database-mappings/
 */
export interface CollectionMappings {
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
  dynamic?: 'true' | 'false' | 'strict' | boolean,
}

/**
 * HTTP routes definition format
 * @example
 * {
 *    <controller>: {
 *      <action>: { verb: <verb>, url: <url> }
 *   }
 * }
 *
 * {
 *    'my-plugin/my-controller': {
 *      action: { verb: 'GET', url: '/some/url' },
 *      action2: { verb: 'GET', url: '/some/url/with/:parameter' }
 *   }
 * }
 */
export interface HttpRoutes {
  /**
   * Controller name
   */
  [key: string]: {
    /**
     * Action name
     */
    [key: string]: {
      /**
       * HTTP verb
       */
      verb: string,
      /**
       * URL
       */
      url: string
    }
  }
}
