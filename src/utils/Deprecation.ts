export class Deprecation {

  private _deprecationWarning: boolean;

  constructor (deprecationWarning: boolean) {
    this._deprecationWarning = deprecationWarning;
  }

  /**
   * Warn the developer that he is using a deprecated action
   * 
   * @param response Result of a query to the API
   * 
   * @returns Same as response param, just like a middleware
   */
  logDeprecation (response) {
    if (this._deprecationWarning && response.deprecations && response.deprecations.length) {
      for (let index = 0; index < response.deprecations.length; index++) {
        // eslint-disable-next-line no-console
        console.warn(response.deprecations[index].message);        
      }
    }
    return response;
  }
}