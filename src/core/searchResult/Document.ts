import { SearchResultBase } from './SearchResultBase';
import { KDocContentGeneric, KHit } from '../../types';

export class DocumentSearchResult<TKDocContent extends KDocContentGeneric> extends SearchResultBase<KHit<TKDocContent>> {
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
