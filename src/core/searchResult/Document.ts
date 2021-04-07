import { SearchResultBase } from './SearchResultBase';
import { DocumentHit } from '../../types';

export class DocumentSearchResult extends SearchResultBase<DocumentHit> {
  /**
   * @param {Kuzzle} kuzzle
   * @param {object} query
   * @param {object} options
   * @param {object} result
   */
  constructor (kuzzle, query, options, result) {
    super(kuzzle, query, options, result);

    this._searchAction = 'search';
    this._scrollAction = 'scroll';
  }
}

module.exports = { DocumentSearchResult };
