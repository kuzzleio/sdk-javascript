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
    collections?: string[];
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
  [key: string]: {
    actions: {
      [key: string]: boolean
    }
  }
}