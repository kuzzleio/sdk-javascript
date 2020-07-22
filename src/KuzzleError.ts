'use strict';

/**
 * Standard Kuzzle error.
 *
 * @see https://docs.kuzzle.io/core/2/api/essentials/error-handling/
 */
export class KuzzleError extends Error {
  /**
   * Http status code
   */
  public status: number;
  /**
   * Stacktrace (only if NODE_ENV=development)
   */
  public stack?: string;
  /**
   * Unique ID
   */
  public id: string;
  /**
   * Code
   */
  public code: number;

  /**
   * Associated errors
   * (PartialError only)
   */
  public errors?: Array<any>;
  /**
   * Number of associated errors
   * (PartialError only)
   */
  public count?: number;

  constructor (apiError) {
    super(apiError.message);

    this.status = apiError.status;
    this.stack = apiError.stack;
    this.id = apiError.id;
    this.code = apiError.code;

    // PartialError
    if (this.status === 206) {
      this.errors = apiError.errors;
      this.count = apiError.count;
    }
  }
}

module.exports = { KuzzleError };