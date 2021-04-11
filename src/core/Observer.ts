import { JSONObject, DocumentNotification } from '../types';
import { KuzzleEventEmitter } from './KuzzleEventEmitter';

export class Observer extends KuzzleEventEmitter {
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

  applyChanges (notification: DocumentNotification): void {
    if (notification.event === 'delete') {
      this.enabled = false;
      this.deleted = true;

      this.emit('delete');
    }
    else {
      const documentChanges = notification.result._source;

      if (! this.notifyOnly) {
        Object.assign(this._source, documentChanges);
      }

      this.emit('change', documentChanges);
    }
  }
}
