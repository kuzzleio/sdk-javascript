'use strict';

import { hilightUserCode } from './utils/stackTrace';
import { RequestPayload } from './types/RequestPayload';
import { JSONObject } from './types';

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
   * API controller name
   */
  public controller?: string;

  /**
   * API action name
   */
  public action?: string;

  /**
   * KuzzleRequest volatile data
   */
  public volatile?: Record<string, unknown>;

  /**
   * Index name
   */
  public index?: string;

  /**
   * Collection name
   */
  public collection?: string;

  /**
   * request id
   */
  public requestId?: string;

  /**
   * Document unique identifier
   */
  public _id?: string;

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
   * BadRequestError: Trololol
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
  constructor (
    apiError: { message: string, status?: number, id?: string, code?: number, errors?: JSONObject[], count?: number, stack?: string },
    sdkStack?: string,
    protocol?: string,
    request?: RequestPayload,
  ) {
    super(apiError.message);

    this.status = apiError.status;
    this.id = apiError.id;
    this.code = apiError.code;

    if (request) {
      this.controller = request.controller;
      this.collection = request.collection;
      this.action = request.action;
      this.index = request.index;
      this.volatile = request.volatile;
      this.requestId = request.requestId;
      this._id = request._id;
    }

    // PartialError
    if (apiError.errors) {
      this.errors = apiError.errors;
      this.count = apiError.count;
    }

    // If we have a stacktrace coming from Kuzzle, merge it with
    // the SDK one
    if (apiError.stack) {
      this.kuzzleStack = apiError.stack;
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
