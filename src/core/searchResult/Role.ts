import { Role } from "../security/Role";
import { SearchResultBase } from "./SearchResultBase";

export class RoleSearchResult extends SearchResultBase<Role> {
  constructor(kuzzle, query, options, result) {
    super(kuzzle, query, options, result);

    this._searchAction = "searchRoles";
    this._scrollAction = null; // scrollRoles action does not exists in Kuzzle API.

    this.hits = this._result.hits.map(
      (hit) => new Role(this._kuzzle, hit._id, hit._source.controllers)
    );
  }

  next() {
    // in Kuzzle API, scrollRoles action is not available, and searchRoles allows only from and size parameters
    // => we deny "scroll" and "sort" parameters.
    if (this._request.scroll || this._request.sort) {
      return Promise.reject(
        new Error("only from/size params are allowed for role search")
      );
    }

    return super.next().then((nextSearchResult: RoleSearchResult) => {
      if (!nextSearchResult) {
        return null;
      }

      nextSearchResult.hits = nextSearchResult._result.hits.map(
        (hit) =>
          new Role(nextSearchResult._kuzzle, hit._id, hit._source.controllers)
      );

      return nextSearchResult;
    });
  }
}
