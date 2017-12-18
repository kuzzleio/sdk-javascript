/**
 * @param {Collection} collection
 * @param {object} filters
 * @param {object} options
 * @param {object} raw 
 * @property {Collection} collection
 * @property {number} total
 * @property {Document[]} documents
 * @property {object} aggregations
 * @property {object} options
 * @property {object} filters
 * @property {number} fetched
 * @constructor
 */
function SearchResult (collection, filters, options, raw) {
  var self = this;

  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: collection,
      enumerable: true
    },
    total: {
      value: raw.result.total,
      enumerable: true
    },
    documents: {
      value: raw.result.hits.map(function (doc) {
        var d = new Document(self, doc._id, doc._source, doc._meta);
        d.version = doc._version;
        return d;
      }),
      enumerable: true
    },
    aggregations: {
      value: aggregations || {},
      enumerable: true
    },
    options: {
      value: {
        from: options.from,
        size: options.size,
        scrollId: options.scrollId
      },
      enumerable: true
    },
    filters: {
      value: filters || {},
      enumerable: true
    },
    // writable properties
    fetched: {
      value: raw.result.hits.length,
      enumerable: true,
      writable: true
    }
  });

  Object.freeze(this.options);
  Object.freeze(this.filters);
  Object.freeze(this.aggregations);

  // promisifying
  if (this.collection.kuzzle.bluebird) {
    return this.collection.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['fetchNext'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * @param {function} cb
 */
SearchResult.prototype.fetchNext = function (cb) {
  var 
    self = this,
    filters,
    opts,
    updateAfterSearch = function (error, result) {
      if (error) {
        return cb(error);
      }

      result.fetched += self.fetched;
      cb(null, result);
    };
  
  this.collection.kuzzle.callbackRequired('SearchResult.fetchNext', cb);

  if (this.fetched >= this.total) {
    return cb(null, null);
  }

  // retrieve next results with scroll if original search use it
  if (this.options.scrollId) {
    this.collection.scroll(this.options.scrollId, null, this.filters || {}, updateAfterSearch);
    return;
  }

  // retrieve next results using ES's search_after
  if (this.options.size !== undefined && this.filters.sort) {
    filters = Object.assign({}, this.filters, {search_after: []});
    opts = {size: this.options.size};

    filters.sort.forEach(function (sortRule) {
      filters.search_after.push(self.documents[self.documents.length - 1].content[Object.keys(sortRule)[0]]);
    });

    this.collection.search(filters, opts, updateAfterSearch);
    return;
  }

  // retrieve next results with from/size if original search use it
  if (this.options.from !== undefined && this.options.size !== undefined) {
    // check if we need to do next request to fetch all matching documents
    opts = {
      from: this.options.from + this.options.size,
      size: this.options.size
    };

    if (opts.from >= this.total) {
      return cb(null, null);
    }

    this.collection.search(this.filters, opts, updateAfterSearch);
    return;
  }

  cb(new Error('Unable to retrieve next results from search: missing scrollId or from/size params'));
};

module.exports = SearchResult;
