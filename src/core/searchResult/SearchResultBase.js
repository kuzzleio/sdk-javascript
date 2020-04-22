class SearchResultBase {

  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {object} request
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, request = {}, options = {}, response = {}) {
    this._kuzzle = kuzzle;
    this._request = request;
    this._response = response;
    this._options = options;

    this._controller = request.controller;
    this._searchAction = 'search';
    this._scrollAction = 'scroll';

    this.aggregations = response.aggregations;
    this.hits = response.hits || [];
    this.fetched = this.hits.length;
    this.total = response.total || 0;
  }

  next () {
    if (this.fetched >= this.total) {
      return Promise.resolve(null);
    }

    if (this._request.scroll) {
      return this._kuzzle.query({
        controller: this._request.controller,
        action: this._scrollAction,
        scroll: this._request.scroll,
        scrollId: this._response.scrollId
      }, this._options)
        .then(response => this._buildNextSearchResult(response));
    }
    else if (this._request.size && this._request.body.sort) {
      const request = { ...this._request, action: this._searchAction };
      const hit = this._response.hits[this._response.hits.length - 1];

      // When sorting only on a non unique field, the search_after will not iterate
      // over all documents having the same values but ES will returns the results
      // directly after.
      // It resulting in having less fetched documents than the total and thus the SDK
      // try to fetch the next results page but it's empty
      if (! hit) {
        return Promise.reject(new Error('Unable to retrieve all results from search: the sort combination must identify one item only. Add document "_id" to the sort.'));
      }

      request.body.search_after = [];

      let sorts;
      if (typeof this._request.body.sort === 'string') {
        sorts = [this._request.body.sort];
      }
      else if (Array.isArray(this._request.body.sort)) {
        sorts = this._request.body.sort;
      }
      else {
        sorts = Object.keys(this._request.body.sort);
      }

      if (sorts.length === 0) {
        return Promise.reject(new Error('Unable to retrieve next results from search: sort param is empty'));
      }

      for (const sort of sorts) {
        const key = typeof sort === 'string'
          ? sort
          : Object.keys(sort)[0];

        const value = key === '_id'
          ? hit._id
          : this._get(hit._source, key.split('.'));

        request.body.search_after.push(value);
      }

      return this._kuzzle.query(request, this._options)
        .then(response => this._buildNextSearchResult(response));
    }
    else if (this._request.size) {
      if (this._request.from >= this._response.total) {
        return Promise.resolve(null);
      }

      return this._kuzzle.query({
        ...this._request,
        action: this._searchAction,
        from: this.fetched
      }, this._options)
        .then(response => this._buildNextSearchResult(response));
    }

    return Promise.reject(new Error('Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params'));
  }

  _get (object, path) {
    if (!object) {
      return object;
    }

    if (path.length === 1) {
      return object[path[0]];
    }

    const key = path.shift();
    return this._get(object[key], path);
  }

  _buildNextSearchResult (response) {
    const nextSearchResult = new this.constructor(this._kuzzle, this._request, this._options, response.result);
    nextSearchResult.fetched += this.fetched;

    return nextSearchResult;
  }

}


module.exports = SearchResultBase;
