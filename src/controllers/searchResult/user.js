const
  SearchResultBase = require('./base'),
  User = require('../security/user');

class UserSearchResult extends SearchResultBase {

  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this._searchAction = 'searchUsers';
    this._scrollAction = 'scrollUsers';
    this.hits = this._response.hits.map(hit => new User(this._kuzzle, hit._id, hit._source, hit._meta));
  }

  next () {
    return super.next()
      .then(result => {
        if (!result) {
          return result;
        }

        this.hits = this._response.hits.map(hit => new User(this._kuzzle, hit._id, hit._source, hit._meta));
        return this;
      });
  }
}

module.exports = UserSearchResult;
