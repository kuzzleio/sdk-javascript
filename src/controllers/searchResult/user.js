const
  SearchResultBase = require('./base'),
  User = require('../security/user');

class UserSearchResult extends SearchResultBase {

  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this.searchAction = 'searchUsers';
    this.scrollAction = 'scrollUsers';
  }

  next () {
    return super.next()
      .then(result => {
        if (!result) {
          return result;
        }

        return result.hits.map(hit => new User(this.kuzzle, hit._id, hit._source, hit._meta));
      });
  }
}

module.exports = UserSearchResult;
