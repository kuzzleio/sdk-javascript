/**
 * @param {Collection} collection
 * @param {int} total
 * @param {Document[]} documents
 * @param {object} aggregations
 * @param {object} searchArgs
 * @param {SearchResult} previous
 * @property {Collection} collection
 * @property {number} total
 * @property {Document[]} documents
 * @property {object} aggregations
 * @property {object} searchArgs
 * @property {number} fetchedDocument
 * @constructor
 */
function SearchResult (collection, total, documents, aggregations, searchArgs, previous) {
  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: collection,
      enumerable: true
    },
    total: {
      value: total,
      enumerable: true
    },
    documents: {
      value: documents,
      enumerable: true
    },
    aggregations: {
      value: aggregations || {},
      enumerable: true
    },
    searchArgs: {
      value: searchArgs || {},
      enumerable: true
    },
    // writable properties
    fetchedDocument: {
      value: previous instanceof SearchResult ? documents.length + previous.fetchedDocument : documents.length,
      enumerable: true,
      writable: true
    }
  });

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
    filters,
    options = Object.assign({}, this.searchArgs.options);
  
  options.previous = this;

  // retrieve next results with scroll if original search use it
  if (options.scrollId && options.scroll) {
    if (this.fetchedDocument >= this.getTotal()) {
      cb(null, null);
      return;
    }

    // from and size parameters are not valid for a scroll action
    if (typeof options.from !== 'undefined') {
      delete options.from;
    }

    if (options.size) {
      delete options.size;
    }

    this.collection.scroll(options.scrollId, options.scroll, options, this.searchArgs.filters || {}, cb);

    return;
  }

  // retrieve next results with from/size if original search use it
  if (options.from !== undefined && options.size !== undefined) {
    filters = Object.assign({}, this.searchArgs.filters);

    // check if we need to do next request to fetch all matching documents
    options.from += options.size;

    if (options.from >= this.getTotal()) {
      cb(null, null);

      return;
    }

    this.collection.search(filters, options, cb);

    return;
  }

  cb(new Error('Unable to retrieve next results from search: missing scrollId or from/size params'));
};

/**
 * @returns {Document[]}
 */
SearchResult.prototype.getDocuments = function () {
  return this.documents;
};

/**
 * @returns {number}
 */
SearchResult.prototype.getTotal = function () {
  return this.total;
};

/**
 * @returns {object}
 */
SearchResult.prototype.getAggregations = function () {
  return this.aggregations;
};

/**
 * @returns {object}
 */
SearchResult.prototype.getSearchArgs = function () {
  return this.searchArgs;
};

/**
 * @returns {object}
 */
SearchResult.prototype.getCollection = function () {
  return this.collection;
};

/**
 * @returns {number}
 */
SearchResult.prototype.getFetchedDocument = function () {
  return this.fetchedDocument;
};

module.exports = SearchResult;
