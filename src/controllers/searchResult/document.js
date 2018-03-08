const
  SearchResultBase = require('./base');

class DocumentsSearchResult extends SearchResultBase {

  /**
   * @param {Kuzzle} kuzzle
   * @param {object} query
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this.searchAction = 'search';
    this.scrollAction = 'scroll';
  }
}

module.exports = DocumentsSearchResult;
