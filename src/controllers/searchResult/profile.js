const
  Profile = require('../security/profile'),
  SearchResultBase = require('./base');

class ProfileSearchResult extends SearchResultBase {

  constructor (kuzzle, request, options, response) {
    super(kuzzle, request, options, response);

    this.searchAction = 'searchProfiles';
    this.scrollAction = 'scrollProfiles';
  }

  next () {
    return super.next()
      .then(result => {
        if (!result) {
          return result;
        }

        return result.hits.map(hit => new Profile(this.kuzzle, hit._id, hit._source.policies));
      });
  }
}

module.exports = ProfileSearchResult;
