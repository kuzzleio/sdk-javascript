/**
 * An interface representing an object with string key and any value
 */
export interface JSONObject {
  [key: string]: JSONObject | any
}
