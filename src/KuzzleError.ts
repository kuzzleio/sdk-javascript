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
   * Stacktrace
   */
  public stack: string;
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

    if (stack) {
      const lines = stack.split('\n');
      lines[0] += apiError.message;
      lines[3] = ' 🡆  ' + lines[3].trimStart();
      this.stack = lines.join('\n');
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
