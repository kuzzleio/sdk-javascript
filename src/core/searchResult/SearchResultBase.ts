import { BaseRequest, JSONObject } from "../../types";
import { RequestPayload } from "../../types/RequestPayload";
import { Kuzzle } from "../../Kuzzle";

export interface SearchResult<T> {
  /**
   * Search aggregations
   */
  aggregations?: JSONObject;

  /**
   * Page results
   */
  hits: Array<T>;

  /**
   * Total number of items that can be retrieved
   */
  total: number;

  /**
   * Number of retrieved items so far
   */
  fetched: number;

  /**
   * Advances through the search results and returns the next page of items.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/core-classes/search-result/next/
   *
   * @example
   * while (result) {
   *   // process result.hits here
   *   result = await result.next();
   * }
   *
   * @returns A SearchResult or null if no more pages
   */
  next(): Promise<SearchResult<T> | null>;
}

export class SearchResultBase<T> implements SearchResult<T> {
  protected _searchAction: string;
  protected _scrollAction: string;
  protected _controller: string;
  protected _request: RequestPayload;
  protected _kuzzle: Kuzzle;
  protected _options: JSONObject;
  protected _result: JSONObject;

  public aggregations?: JSONObject;

  public suggest: JSONObject;

  public hits: Array<T>;

  public total: number;

  public fetched: number;

  constructor(
    kuzzle: Kuzzle,
    request: BaseRequest,
    options: JSONObject = {},
    result: any = {},
  ) {
    Reflect.defineProperty(this, "_kuzzle", {
      value: kuzzle,
    });
    Reflect.defineProperty(this, "_request", {
      value: request,
    });
    Reflect.defineProperty(this, "_options", {
      value: options,
    });
    Reflect.defineProperty(this, "_result", {
      value: result,
    });
    Reflect.defineProperty(this, "_controller", {
      value: request.controller,
      writable: true,
    });
    Reflect.defineProperty(this, "_searchAction", {
      value: "search",
      writable: true,
    });
    Reflect.defineProperty(this, "_scrollAction", {
      value: "scroll",
      writable: true,
    });

    this.aggregations = result.aggregations;
    this.hits = result.hits || [];
    this.fetched = this.hits.length;
    this.total = result.total || 0;
    this.suggest = result.suggest;
  }

  next(): Promise<SearchResult<T> | null> {
    if (this.fetched >= this.total) {
      return Promise.resolve(null);
    }

    if (this._request.scroll) {
      return this._kuzzle
        .query({
          action: this._scrollAction,
          controller: this._request.controller,
          scroll: this._request.scroll,
          scrollId: this._result.scrollId,
        })
        .then(({ result }) => this._buildNextSearchResult(result));
    } else if (this._request.size && this._request.body.sort) {
      const request = { ...this._request, action: this._searchAction };
      const hit = this._result.hits[this._result.hits.length - 1];

      // When sorting only on a non unique field, the search_after will not iterate
      // over all documents having the same values but ES will returns the results
      // directly after.
      // It resulting in having less fetched documents than the total and thus the SDK
      // try to fetch the next results page but it's empty
      if (!hit) {
        return Promise.reject(
          new Error(
            'Unable to retrieve all results from search: the sort combination must identify one item only. Add document "_id" to the sort.',
          ),
        );
      }

      request.body.search_after = [];

      let sorts;
      if (typeof this._request.body.sort === "string") {
        sorts = [this._request.body.sort];
      } else if (Array.isArray(this._request.body.sort)) {
        sorts = this._request.body.sort;
      } else {
        sorts = Object.keys(this._request.body.sort);
      }

      if (sorts.length === 0) {
        return Promise.reject(
          new Error(
            "Unable to retrieve next results from search: sort param is empty",
          ),
        );
      }

      for (const sort of sorts) {
        const key = typeof sort === "string" ? sort : Object.keys(sort)[0];

        const value =
          key === "_id" ? hit._id : this._get(hit._source, key.split("."));

        request.body.search_after.push(value);
      }

      return this._kuzzle
        .query(request, this._options)
        .then(({ result }) => this._buildNextSearchResult(result));
    } else if (this._request.size) {
      if (this._request.from >= this._result.total) {
        return Promise.resolve(null);
      }

      return this._kuzzle
        .query({
          ...this._request,
          action: this._searchAction,
          from: this.fetched,
        })
        .then(({ result }) => this._buildNextSearchResult(result));
    }

    return Promise.reject(
      new Error(
        "Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params",
      ),
    );
  }

  protected _get(object, path) {
    if (!object) {
      return object;
    }

    if (path.length === 1) {
      return object[path[0]];
    }

    const key = path.shift();
    return this._get(object[key], path);
  }

  protected _buildNextSearchResult(result) {
    const Constructor: any = this.constructor;

    const nextSearchResult = new Constructor(
      this._kuzzle,
      this._request,
      this._options,
      result,
    );
    nextSearchResult.fetched += this.fetched;

    return nextSearchResult;
  }
}
