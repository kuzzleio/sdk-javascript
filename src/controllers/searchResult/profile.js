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

        return result.hits.map(hit => {
          const profile = new Profile(this.kuzzle);

          profile._id = hit._id;
          profile.policies = hit._source.policies;

          return profile;
        });
      });
  }
}

module.exports = ProfileSearchResult;
