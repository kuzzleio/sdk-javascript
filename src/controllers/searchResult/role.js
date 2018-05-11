const
  Role = require('../security/role'),
  SearchResultBase = require('./base');

class RoleSearchResult extends SearchResultBase {

  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this.searchAction = 'searchRoles';
    this.scrollAction = 'scrollRoles';
  }

  next () {
    return super.next()
      .then(result => {
        if (!result) {
          return result;
        }

        return result.hits.map(hit => new Role(this.kuzzle, hit._id, hit._source.controllers));
      });
  }
}

module.exports = RoleSearchResult;
