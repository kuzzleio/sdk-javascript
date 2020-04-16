const Profile = require('../security/Profile');
const SearchResultBase = require('./SearchResultBase');

class ProfileSearchResult extends SearchResultBase {

  constructor (kuzzle, request, options, response) {
    super(kuzzle, request, options, response);

    this._searchAction = 'searchProfiles';
    this._scrollAction = 'scrollProfiles';
    this.hits = response.hits.map(hit => new Profile(this._kuzzle, hit._id, hit._source.policies));
  }

  next () {
    return super.next()
      .then(nextSearchResult => {
        if (! nextSearchResult) {
          return null;
        }

        nextSearchResult.hits = nextSearchResult._response.hits.map(hit => new Profile(nextSearchResult._kuzzle, hit._id, hit._source.policies));
        return nextSearchResult;
      });
  }
}

module.exports = ProfileSearchResult;
