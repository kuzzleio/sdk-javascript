import { SearchResultBase } from "./SearchResultBase";
import { JSONObject } from "../../types";

export class SpecificationsSearchResult extends SearchResultBase<JSONObject> {
  constructor(kuzzle, query, options, result) {
    super(kuzzle, query, options, result);

    this._controller = "collection";
    this._searchAction = "searchSpecifications";
    this._scrollAction = "scrollSpecifications";
  }
}
