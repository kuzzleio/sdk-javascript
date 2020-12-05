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
export type ProfilePolicy = {
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
