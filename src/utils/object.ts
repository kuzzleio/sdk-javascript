import { JSONObject } from '../types';

export function deepCompare (a: JSONObject, b: JSONObject): boolean {
  const entriesA = Object.entries(a).sort();
  const entriesB = Object.entries(b).sort();

  if (entriesA.length !== entriesB.length) {
    return false;
  }

  for (let i = 0; i < entriesA.length; i++) {
    const [kA, vA] = entriesA[i];
    const [kB, vB] = entriesB[i];

    if (kA !== kB) {
      return false;
    }

    if (typeof vA !== typeof vA) {
      return false;
    }

    if (typeof vA === 'object') {
      if (! deepCompare(vA, vB)) {
        return false;
      }
    }
    else if (vA !== vB) {
      return false;
    }
  }

  return true;
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
