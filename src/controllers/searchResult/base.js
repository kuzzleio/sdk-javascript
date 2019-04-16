class SearchResultBase {

  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {object} request
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, request = {}, options = {}, response = {}) {
    this.kuzzle = kuzzle;
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
      return this.kuzzle.query({
        controller: this._request.controller,
        action: this._scrollAction,
        scrollId: this._response.scrollId
      }, this._options)
        .then(response => {
          const result = response.result;
          this.fetched += result.hits.length;
          this._response = result;
          this.aggregations = result.aggregations;
          this.hits = result.hits;
          return this;
        });
    }
    else if (this._request.size && this._request.sort) {
      const
        request = Object.assign({}, this._request, {
          action: this._searchAction,
          search_after: []
        }),
        hit = this._response.hits && this._response.hits[this._response.hits.length -1];

      for (const sort of this._request.sort) {
        const key = typeof sort === 'string'
          ? sort
          : Object.keys(sort)[0];
        const value = key === '_uid'
          ? this._request.collection + '#' + hit._id
          : this._get(hit._source, key.split('.'));

        request.search_after.push(value);
      }

      return this.kuzzle.query(request, this._options)
        .then(response => {
          const result = response.result;
          this.fetched += result.hits.length;
          this._response = result;
          this.aggregations = result.aggregations;
          this.hits = result.hits;
          return this;
        });
    }
    else if (this._request.size) {
      if (this._request.from >= this._response.total) {
        return Promise.resolve(null);
      }

      return this.kuzzle.query(Object.assign({}, this._request, {
        action: this._searchAction,
        from: this.fetched
      }), this._options)
        .then(response => {
          const result = response.result;
          this.fetched += result.hits.length;
          this._response = result;
          this.aggregations = result.aggregations;
          this.hits = result.hits;
          return this;
        });
    }

    throw new Error('Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params');
  }

  /**
   * Automatically fetch each page of results and execute the provided action
   * on each hit.
   *
   * If the action return a promise, this function will wait for all promise to
   * be resolved.
   *
   * @param {Function} action - Action to execute for each hit
   * @returns {Promise}
   */
  async forEachHit(action) {
    const promises = [];
    let results = this;

    while (results) {
      for (const hit of results.hits) {
        const ret = action(hit);

        if (ret && typeof ret.then === 'function') {
          promises.push(ret);
        }
      }

      results = await results.next();
    }

    return Promise.all(promises);
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

}


module.exports = SearchResultBase;
