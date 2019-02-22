const SearchResultBase = require('./base');

class SpecificationsSearchResult extends SearchResultBase {

  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this._controller = 'collection';
    this._searchAction = 'searchSpecifications';
    this._scrollAction = 'scrollSpecifications';
  }
}

module.exports = SpecificationsSearchResult;
