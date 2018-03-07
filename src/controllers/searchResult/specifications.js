const SearchResultBase = require('./base');

class SpecificationsSearchResult extends SearchResultBase {

  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this.controller = 'collection';
    this.searchAction = 'searchSpecifications';
    this.scrollAction = 'scrollSpecifications';
  }
}

module.exports = SpecificationsSearchResult;
