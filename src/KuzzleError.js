'use strict';

class KuzzleError extends Error {
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

module.exports = KuzzleError;
