import { JSONObject } from '../types';

export function omit (object: JSONObject, properties: string[]): JSONObject {
  const result = {};

  for (const [key, value] of Object.entries(object)) {
    if (! properties.includes(key)) {
      result[key] = value;
    }
  }

  return result;
}
