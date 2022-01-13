import { JSONObject } from '../types';

export function deepCompare (a: JSONObject, b: JSONObject): boolean {
  return Object.entries(a).sort().toString() === Object.entries(b).sort().toString();
}

export function omit (object: JSONObject, properties: string[]): JSONObject {
  const result = {};

  for (const [key, value] of Object.entries(object)) {
    if (! properties.includes(key)) {
      result[key] = value;
    }
  }

  return result;
}
