import { JSONObject } from './JSONObject';

/**
 * Kuzzle API response payload
 *
 * @see https://docs.kuzzle.io/core/2/api/payloads/response
 */
export type ResponsePayload = {
  /**
   * API controller name
   */
  controller: string;

  /**
   * API action name
   */
  action: string;

  /**
   * Index name
   */
  index?: string;

  /**
   * Collection name
   */
  collection?: string;

  /**
   * Document unique identifier
   */
  _id?: string;

  /**
   * API error
   */
  error?: {
    /**
     * Error human readable identifier
     */
    id: string;

    /**
     * Error identifier
     */
    code: number;

    /**
     * Error message
     */
    message: string;

    /**
     * HTTP status error code
     */
    status: number;

    /**
     * Error stacktrace (only if NODE_ENV=development)
     */
    stack?: string;
  };

  /**
   * Request unique identifier
   */
  requestId: string;

  /**
   * API action result
   */
  result: any;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Volatile data
   */
  volatile?: JSONObject;

  /**
   * Room unique identifier
   */
  room?: string;
}
