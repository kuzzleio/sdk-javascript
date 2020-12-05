import { JSONObject } from './JSONObject';

/**
 * Kuzzle API request payload
 *
 * @see https://docs.kuzzle.io/core/2/api/payloads/request
 */
export type RequestPayload = {
  /**
   * API controller name
   */
  controller?: string;

  /**
   * API action name
   */
  action?: string;

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
   * Authentication token
   */
  jwt?: string;

  /**
   * Volatile data
   */
  volatile?: JSONObject;

  /**
   * Request body
   */
  body?: JSONObject;

  /**
   * Request unique identifier
   */
  requestId?: string;

  [key: string]: any;
}