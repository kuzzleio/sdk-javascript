import { JSONObject } from '../types';

export function omit (object: JSONObject, omitted: string[]): JSONObject {
  const result = {};

  for (const [key, value] of Object.entries(object)) {
    if (! omitted.includes(key)) {
      result[key] = value;
    }
  }

  return result;
}
