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

        return result.hits.map(hit => {
          const role = new Role(this.kuzzle);

          role._id = hit._id;
          role.controllers = hit._source.controllers;

          return role;
        });
      });
  }
}

module.exports = RoleSearchResult;
