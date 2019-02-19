'use strict';

class KuzzleError extends Error {
  constructor (apiError) {
    super(apiError.message);

    this.status = apiError.status;
    this.stack = apiError.stack;
  }
}

module.exports = KuzzleError;
