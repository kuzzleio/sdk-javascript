import { JSONObject } from '../types';
import { KuzzleEventEmitter } from './KuzzleEventEmitter';

export class RealtimeDocument extends KuzzleEventEmitter {
  mutate: boolean;
  enabled: boolean;
  deleted: boolean;

  _id: string;
  _source: JSONObject;
  _score: number;

  constructor (
    document: JSONObject,
    options: { mutate?: boolean } = {}
  ) {
    super();

    this._id = document._id;
    this._source = document._source;
    this._score = document._score;

    this.mutate = options.mutate || true;
    this.enabled = false;
  }
}
