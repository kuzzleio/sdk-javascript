/**
 *
 * @param {Collection} dataCollection
 * @param {int} total
 * @param {Document[]} documents
 * @param {object} [aggregations]
 * @param {object} [searchArgs]
 * @param {KuzzleSearchResult} [previous]
 * @constructor
 */
function KuzzleSearchResult (dataCollection, total, documents, aggregations, searchArgs, previous) {
  Object.defineProperties(this, {
    // read-only properties
    dataCollection: {
      value: dataCollection,
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
      value: documents.length,
      enumerable: true,
      writable: true
    },
    _previous: {
      value: previous || null,
      writable: true
    },
    _next: {
      value: null,
      writable: true
    }
  });

  if (this._previous instanceof KuzzleSearchResult) {
    this._previous._next = this;
    this.fetchedDocument += this._previous.fetchedDocument;
  }

  // promisifying
  if (this.dataCollection.kuzzle.bluebird) {
    return this.dataCollection.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['previous', 'next'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}


/**
 * @param cb
 * @returns {*}
 */
KuzzleSearchResult.prototype.previous = function (cb) {
  cb(null, this._previous);

  return this;
};

/**
 * @param {function} cb
 */
KuzzleSearchResult.prototype.next = function (cb) {
  var
    filters,
    options = Object.assign({}, this.searchArgs.options),
    self = this;

  if (!this._next) {
    // retrieve next results with scroll if original search use it
    if (options.scrollId) {
      if (this.fetchedDocument >= this.total) {
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

      this.dataCollection.scroll(
        options.scrollId,
        options,
        this.searchArgs.filters || {},
        function(error, newSearchResults) {
          handleNextSearchResults(error, self, newSearchResults, cb);
        }
      );

      return;
    }
    // retrieve next results with from/size if original search use it
    else if (options.from !== undefined && options.size !== undefined) {
      filters = Object.assign({}, this.searchArgs.filters);

      // check if we need to do next request to fetch all matching documents
      options.from += options.size;

      if (options.from >= this.total) {
        cb(null, null);

        return;
      }

      this.dataCollection.search(
        filters,
        options,
        function(error, newSearchResults) {
          handleNextSearchResults(error, self, newSearchResults, cb);
        }
      );

      return;
    }
  }

  if (this._next instanceof KuzzleSearchResult) {
    cb(null, this._next);

    return;
  }

  cb(new Error('Unable to retrieve next results from search: missing scrollId or from/size params'));
};

/**
 * @param {Error} error
 * @param {KuzzleSearchResult} currentSearchResults
 * @param {KuzzleSearchResult} newSearchResults
 * @param {Function} cb
 */
function handleNextSearchResults (error, currentSearchResults, newSearchResults, cb) {
  if (error) {
    cb(error);
    return;
  }

  newSearchResults.fetchedDocument += currentSearchResults.fetchedDocument;

  newSearchResults._previous = currentSearchResults;
  currentSearchResults._next = newSearchResults;


  cb(null, newSearchResults);
}

module.exports = KuzzleSearchResult;
