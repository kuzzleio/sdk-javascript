/**
 * HTTP routes definition format
 *
 * @see https://docs.kuzzle.io/core/2/guides/develop-on-kuzzle/api-controllers/#http-routes
 *
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
export type HttpRoutes = {
  /**
   * Controller name
   */
  [controller: string]: {
    /**
     * Action name
     */
    [action: string]: {
      /**
       * HTTP verb
       */
      verb: string;
      /**
       * URL
       */
      url: string;
    };
  };
};
