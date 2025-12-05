import { Profile } from "../security/Profile";
import { SearchResultBase } from "./SearchResultBase";

export class ProfileSearchResult extends SearchResultBase<Profile> {
  constructor(kuzzle, request, options, result) {
    super(kuzzle, request, options, result);

    this._searchAction = "searchProfiles";
    this._scrollAction = "scrollProfiles";
    this.hits = result.hits.map(
      (hit) => new Profile(this._kuzzle, hit._id, hit._source),
    );
  }

  next() {
    return super.next().then((nextSearchResult: ProfileSearchResult) => {
      if (!nextSearchResult) {
        return null;
      }

      nextSearchResult.hits = nextSearchResult._result.hits.map(
        (hit) => new Profile(nextSearchResult._kuzzle, hit._id, hit._source),
      );

      return nextSearchResult;
    });
  }
}
