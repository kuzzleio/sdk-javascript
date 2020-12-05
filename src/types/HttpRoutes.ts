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
      verb: string,
      /**
       * URL
       */
      url: string
    }
  }
}
