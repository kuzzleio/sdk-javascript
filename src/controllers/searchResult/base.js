class SearchResultBase {

  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {object} query
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, query = {}, options = {}, response = {}) {
    this.kuzzle = kuzzle;
    this.query = query;
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

    if (this.options.scroll) {
      const options = Object.assign({}, this.options);
      options.scrollId = this.response.scrollId;

      return this.kuzzle.query({
        controller: this.controller,
        action: this.scrollAction,
      }, this.query, options)
        .then(r => {
          this.fetched += r.hits.length;
          this.response = r;
          return this;
        });
    }

    if (this.options.size && this.options.sort) {
      const
        query = Object.assign({}, this.query, {
          search_after: []
        }),
        hit = this.response.hits && this.response.hits[this.response.hits.length -1];

      for (const sort of this.query.sort) {
        if (typeof sort === 'string') {
          query.search_after.push(hit._source[sort]);
        }
        else {
          query.search_after.push(hit._source[Object.keys(sort)[0]]);
        }
      }

      return this.kuzzle.query({
        controller: this.controller,
        action: this.searchAction
      }, query, this.options)
        .then(r => {
          this.fetched += r.hits.length;
          this.response = r;
          return this;
        });
    }

    if (this.options.from && this.options.size) {
      if (this.options.from >= this.response.total) {
        return Promise.resolve(null);
      }

      this.options.from += this.options.size;

      return this.kuzzle.query({
        controller: this.controller,
        action: this.searchAction,
      }, this.query, this.options)
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
