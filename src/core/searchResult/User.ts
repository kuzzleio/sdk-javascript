import { SearchResultBase } from "./SearchResultBase";
import { User } from "../security/User";

export class UserSearchResult extends SearchResultBase<User> {
  constructor(kuzzle, query, options, result) {
    super(kuzzle, query, options, result);

    this._searchAction = "searchUsers";
    this._scrollAction = "scrollUsers";
    this.hits = this._result.hits.map(
      (hit) => new User(this._kuzzle, hit._id, hit._source),
    );
  }

  next() {
    return super.next().then((nextSearchResult: UserSearchResult) => {
      if (!nextSearchResult) {
        return null;
      }

      nextSearchResult.hits = nextSearchResult._result.hits.map(
        (hit) => new User(nextSearchResult._kuzzle, hit._id, hit._source),
      );

      return nextSearchResult;
    });
  }
}
