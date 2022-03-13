import { KDocContentGeneric } from '../types';

/**
 * Represents a realtime document that will mutate it's content in realtime
 * according to database changes.
 *
 * Use the `Observer` class to manipulate such documents.
 */
export class RealtimeDocument<TKDocContent extends KDocContentGeneric> {
  /**
   * Document ID
   */
  public _id: string;

  /**
   * Document content
   *
   * This will be updated when the content changes in the database
   */
  public _source: TKDocContent;

  /**
   * Indicate if the document has been deleted in the database
   */
  public deleted: boolean;

  constructor ({ _id, _source }: { _id: string, _source: TKDocContent }) {
    this._id = _id;
    this._source = _source;
    this.deleted = false;
  }
}
