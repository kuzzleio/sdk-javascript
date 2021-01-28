'use strict';

import { hilightUserCode } from './utils/stackTrace';

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

  /**
   * This class represents a Kuzzle API error.
   * The SDK stack is needed alongside the protocol used.
   * Those information will allow to construct a enhanced stacktrace:
   *
   * BadRequestError: lol
          at new BadRequestError (/home/aschen/projets/kuzzleio/kuzzle/lib/kerror/errors/badRequestError.ts:26:5)
    >    at BaseController.handler [as sayHello] (/home/aschen/projets/kuzzleio/kuzzle/test.js:9:15)
          at doAction (/home/aschen/projets/kuzzleio/kuzzle/lib/api/funnel.js:759:47)
          at Funnel.processRequest (/home/aschen/projets/kuzzleio/kuzzle/lib/api/funnel.js:423:34)
              |
              |
              HttpProtocol
              |
              |
          at HttpProtocol.query (/home/aschen/projets/kuzzleio/sdk-javascript/src/protocols/abstract/Base.ts:127:19)
          at Proxy.query (/home/aschen/projets/kuzzleio/sdk-javascript/src/Kuzzle.ts:598:26)
    >    at /home/aschen/projets/kuzzleio/sdk-javascript/test.js:8:18
          at processTicksAndRejections (internal/process/task_queues.js:97:5)
   */
  constructor (apiError, sdkStack: string, protocol: string) {
    super(apiError.message);

    this.status = apiError.status;

    this.id = apiError.id;
    this.code = apiError.code;

    // PartialError
    if (this.status === 206) {
      this.errors = apiError.errors;
      this.count = apiError.count;
    }

    // If we have a stacktrace coming from Kuzzle, merge it with
    // the SDK one
    if (apiError.stack) {
      this.stack = apiError.stack + '\n';
      this.stack += '          |\n';
      this.stack += '          |\n';
      this.stack += `          ${protocol}\n`;
      this.stack += '          |\n';
      this.stack += '          |\n';
    }
    else {
      this.stack = `KuzzleError: ${apiError.message}\n`;
    }

    // Append the SDK stacktrace
    this.stack += sdkStack
      .split('\n')
      .map(hilightUserCode)
      .slice(1)
      .join('\n');
  }
}
