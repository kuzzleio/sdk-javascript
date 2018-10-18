let _kuzzle;

class SearchResultBase {

  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {object} request
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, request = {}, options = {}, response = {}) {
    _kuzzle = kuzzle;
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
      return _kuzzle.query(Object.assign({}, this._request, {
        action: this._scrollAction,
        scrollId: this._response.scrollId
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

    if (this._request.size && this._request.sort) {
      const
        request = Object.assign({}, this._request, {
          action: this._searchAction,
          search_after: []
        }),
        hit = this._response.hits && this._response.hits[this._response.hits.length -1];

      for (const sort of this._request.sort) {
        if (typeof sort === 'string') {
          request.search_after.push(hit._source[sort]);
        }
        else {
          request.search_after.push(hit._source[Object.keys(sort)[0]]);
        }
      }

      return _kuzzle.query(request, this._options)
        .then(response => {
          const result = response.result;
          this.fetched += result.hits.length;
          this._response = result;
          this.aggregations = result.aggregations;
          this.hits = result.hits;
          return this;
        });
    }

    if (this._request.from && this._request.size) {
      if (this._request.from >= this._response.total) {
        return Promise.resolve(null);
      }

      return _kuzzle.query(Object.assign({}, this._request, {
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
}

module.exports = SearchResultBase;
