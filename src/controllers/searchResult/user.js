const
  SearchResultBase = require('./base'),
  User = require('../security/user');

class UserSearchResult extends SearchResultBase {

  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this._searchAction = 'searchUsers';
    this._scrollAction = 'scrollUsers';
    this.hits = this._response.hits.map(hit => new User(this._kuzzle, hit._id, hit._source));
  }

  next () {
    return super.next()
      .then(nextSearchResult => {
        if (! nextSearchResult) {
          return null;
        }

        nextSearchResult.hits = nextSearchResult._response.hits.map(hit => new User(nextSearchResult._kuzzle, hit._id, hit._source));
        return nextSearchResult;
      });
  }
}

module.exports = UserSearchResult;
