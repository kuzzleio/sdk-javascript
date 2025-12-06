import { SearchResultBase } from "./SearchResultBase";
import { KDocumentContentGeneric, KHit } from "../../types";

export class DocumentSearchResult<
  TKDocumentContent extends KDocumentContentGeneric,
> extends SearchResultBase<KHit<TKDocumentContent>> {
  /**
   * @param {Kuzzle} kuzzle
   * @param {object} query
   * @param {object} options
   * @param {object} result
   */
  constructor(kuzzle, query, options, result) {
    super(kuzzle, query, options, result);

    this._searchAction = "search";
    this._scrollAction = "scroll";
  }
}
