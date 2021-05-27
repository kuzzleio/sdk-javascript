'use strict';

import { RequestPayload } from './types/RequestPayload';

/**
 * Request Timeout error.
 */
export class RequestTimeoutError extends Error {
  /**
   * Delay after which the request has timedout
   */
  delay: number;
  /**
   * The request that has been rejected
   */
  request: RequestPayload;

  constructor(request: RequestPayload, delay: number) {
    super(`Request timed out after ${delay} ms`);
    this.request = request;
    this.delay = delay;
  }
}