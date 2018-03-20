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
    this.request = request;
    this.options = options;
    this.response = response;

    this.fetched = response.hits && response.hits.length || 0;
    this.total = response.total && response.total || 0;

    this.controller = 'controller';
    this.searchAction = 'search';
    this.scrollAction = 'scroll';
  }

  next () {
    if (this.fetched >= this.total) {
      return Promise.resolve(null);
    }

    if (this.request.scroll) {
      return this.kuzzle.query(Object.assign({}, this.request, {
        scrollId: this.response.scrollId
      }), options)
        .then(r => {
          this.fetched += r.hits.length;
          this.response = r;
          return this;
        });
    }

    if (this.request.size && this.request.sort) {
      const
        request = Object.assign({}, this.request, {
          search_after: []
        }),
        hit = this.response.hits && this.response.hits[this.response.hits.length -1];

      for (const sort of this.request.sort) {
        if (typeof sort === 'string') {
          request.search_after.push(hit._source[sort]);
        }
        else {
          request.search_after.push(hit._source[Object.keys(sort)[0]]);
        }
      }

      return this.kuzzle.query(request, this.options)
        .then(r => {
          this.fetched += r.hits.length;
          this.response = r;
          return this;
        });
    }

    if (this.request.from && this.request.size) {
      if (this.request.from >= this.response.total) {
        return Promise.resolve(null);
      }

      return this.kuzzle.query(Object.assign({}, this.request, {
        from: this.fetched + 1
      }), this.options)
        .then(r => {
          this.fetched += r.hits.length;
          this.response = r;
          return this;
        });
    }

    return Promise.reject(new Error('Unable to retrieve next results from search: missing scrollId or from/size params'));
  }
}

module.exports = SearchResultBase;
