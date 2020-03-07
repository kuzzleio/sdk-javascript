const KuzzleEventEmitter = require('../../core/KuzzleEventEmitter');

class SearchResultBase extends KuzzleEventEmitter {

  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {object} request
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, request = {}, options = {}, response = {}) {
    Reflect.defineProperty(this, '_kuzzle', {
      enumerable: false,
      value: kuzzle
    });

    Reflect.defineProperty(this, '_request', {
      enumerable: false,
      writable: true,
      value: request
    });

    Reflect.defineProperty(this, '_response', {
      enumerable: false,
      writable: true,
      value: response
    });

    Reflect.defineProperty(this, '_options', {
      enumerable: false,
      writable: true,
      value: options
    });

    Reflect.defineProperty(this, '_controller', {
      enumerable: false,
      writable: true,
      value: request.controller
    });

    Reflect.defineProperty(this, '_searchAction', {
      enumerable: false,
      writable: true,
      value: 'search'
    });


    Reflect.defineProperty(this, '_scrollAction', {
      enumerable: false,
      writable: true,
      value: 'scroll'
    });

    if (response.aggregations) {
      this.aggregations = response.aggregations;
    }
    this.hits = response.hits || [];
    this.fetched = response.hits.length;
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
      const
        request = Object.assign({}, this._request, {
          action: this._searchAction
        }),
        hit = this._response.hits[this._response.hits.length - 1];

      request.body.search_after = [];

      for (const sort of this._request.body.sort) {
        const key = typeof sort === 'string'
          ? sort
          : Object.keys(sort)[0];
        const value = key === '_uid'
          ? this._request.collection + '#' + hit._id
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

      return this._kuzzle.query(Object.assign({}, this._request, {
        action: this._searchAction,
        from: this.fetched
      }), this._options)
        .then(response => this._buildNextSearchResult(response));
    }

    throw new Error('Unable to retrieve next results from search: missing scrollId, from/sort, or from/size params');
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
