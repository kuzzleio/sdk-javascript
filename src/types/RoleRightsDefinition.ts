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
 * @see https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/#roles
 */
export type RoleRightsDefinition = {
  /**
   * API controller name
   */
  [controller: string]: {
    actions: {
      /**
       * API action name
       */
      [action: string]: boolean;
    };
  };
};
