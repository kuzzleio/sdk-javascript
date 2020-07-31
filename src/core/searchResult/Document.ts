import { SearchResultBase } from './SearchResultBase';
import { DocumentHit } from '../../utils/interfaces';

export class DocumentSearchResult extends SearchResultBase<DocumentHit> {
  /**
   * @param {Kuzzle} kuzzle
   * @param {object} query
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this._searchAction = 'search';
    this._scrollAction = 'scroll';
  }
}

module.exports = { DocumentSearchResult };
