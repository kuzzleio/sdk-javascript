import { JSONObject } from '../types';

export class RealtimeDocument {
  public _id: string;
  public _source: JSONObject;
  public deleted: boolean;

  constructor ({ _id, _source }) {
    this._id = _id;
    this._source = _source;
    this.deleted = false;
  }
}