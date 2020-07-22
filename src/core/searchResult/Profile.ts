import { Profile } from '../security/Profile';
import { SearchResultBase } from './SearchResultBase';

export class ProfileSearchResult extends SearchResultBase<Profile> {
  constructor (kuzzle, request, options, response) {
    super(kuzzle, request, options, response);

    this._searchAction = 'searchProfiles';
    this._scrollAction = 'scrollProfiles';
    this.hits = response.hits.map(hit => (
      new Profile(this._kuzzle, hit._id, hit._source)
    ));
  }

  next () {
    return super.next()
      .then((nextSearchResult: ProfileSearchResult) => {
        if (! nextSearchResult) {
          return null;
        }

        nextSearchResult.hits = nextSearchResult._response.hits.map(hit => (
          new Profile(nextSearchResult._kuzzle, hit._id, hit._source)
        ));

        return nextSearchResult;
      });
  }
}
