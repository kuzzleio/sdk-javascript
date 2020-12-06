'use strict';

/**
 * Standard Kuzzle error.
 *
 * @see https://docs.kuzzle.io/core/2/api/errors/types/
 */
export class KuzzleError extends Error {
  /**
   * Http status code
   */
  public status: number;
  /**
   * Stacktrace
   */
  public stack: string;
  /**
   * Kuzzle stacktrace (development mode only)
   */
  public kuzzleStack?: string;
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

  constructor (apiError, stack = null) {
    super(apiError.message);

    this.status = apiError.status;
    if (apiError.stack) {
      Reflect.defineProperty(this, 'kuzzleStack', {
        value: apiError.stack
      });
    }

    this.id = apiError.id;
    this.code = apiError.code;

    // PartialError
    if (this.status === 206) {
      this.errors = apiError.errors;
      this.count = apiError.count;
    }
  }
}
