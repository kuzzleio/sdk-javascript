import { SearchResultBase } from './SearchResultBase';

class DocumentsSearchResult extends SearchResultBase {
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

module.exports = { DocumentsSearchResult };
