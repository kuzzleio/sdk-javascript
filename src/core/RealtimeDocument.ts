import { JSONObject, DocumentNotification } from '../types';
import { KuzzleEventEmitter } from './KuzzleEventEmitter';

export class RealtimeDocument extends KuzzleEventEmitter {
  notifyOnly: boolean;
  enabled: boolean;
  deleted: boolean;

  _id: string;
  _source: JSONObject;
  _score: number;

  constructor (
    document: JSONObject,
    options: { notifyOnly?: boolean } = {}
  ) {
    super();

    this._id = document._id;
    this._source = document._source;
    this._score = document._score;

    this.notifyOnly = options.notifyOnly || false;
    this.enabled = false;
  }

  start () {
    this.enabled = true;
  }

  stop () {
    this.enabled = false;
  }
}
