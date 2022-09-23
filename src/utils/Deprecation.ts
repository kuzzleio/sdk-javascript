import { ResponsePayload } from "../types/ResponsePayload";

export class Deprecation {
  private deprecationWarning: boolean;

  constructor(deprecationWarning: boolean) {
    this.deprecationWarning =
      process.env.NODE_ENV !== "production" ? deprecationWarning : false;
  }

  /**
   * Warn the developer that he is using a deprecated action (disabled if NODE_ENV=production)
   *
   * @param response Result of a query to the API
   *
   * @returns Same as response param, just like a middleware
   */
  logDeprecation(response: ResponsePayload) {
    if (
      this.deprecationWarning &&
      response.deprecations &&
      response.deprecations.length
    ) {
      for (const deprecation of response.deprecations) {
        // eslint-disable-next-line no-console
        console.warn(deprecation.message);
      }
    }
    return response;
  }
}
