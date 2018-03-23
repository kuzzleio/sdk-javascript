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

        return result.hits.map(hit => {
          const user = new User(this.kuzzle);

          user._id = hit._id;
          user.content = hit._source;
          user.meta = hit._meta;

          return user;
        });
      });
  }
}

module.exports = UserSearchResult;
