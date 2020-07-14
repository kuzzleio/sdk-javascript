'use strict';

/**
 * An interface representing an object with string key and any value
 */
export interface JSONObject {
  [key: string]: JSONObject | any
}


export interface KuzzleRequest extends JSONObject {
  controller?: string;
  action?: string;
  index?: string;
  collection?: string;
  _id?: string;
  jwt?: string;
  volatile?: JSONObject;
  body?: JSONObject;
}
