const
  SearchResultBase = require('./base'),
  User = require('../security/user');

class UserSearchResult extends SearchResultBase {

  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this.searchAction = 'searchUsers';
    this.scrollAction = 'scrollUsers';
    this.hits = this.response.hits.map(hit => new User(this.kuzzle, hit._id, hit._source, hit._meta));
  }

  next () {
    return super.next()
      .then(result => {
        if (!result) {
          return result;
        }

        this.hits = this.response.hits.map(hit => new User(this.kuzzle, hit._id, hit._source, hit._meta));
        return this;
      });
  }
}

module.exports = UserSearchResult;
