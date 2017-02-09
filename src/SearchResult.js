/**
 * @param {Collection} dataCollection
 * @param {int} total
 * @param {Document[]} documents
 * @param {object} [aggregations]
 * @param {object} [searchArgs]
 * @param previous
 * @property {Collection} dataCollection
 * @property {number} fetchedDocument
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
      value: previous instanceof KuzzleSearchResult ? documents.length + previous.fetchedDocument : documents.length,
      enumerable: true,
      writable: true
    }
  });

  // promisifying
  if (this.dataCollection.kuzzle.bluebird) {
    return this.dataCollection.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['next'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * @param {function} cb
 */
KuzzleSearchResult.prototype.next = function (cb) {
  var
    filters,
    options = Object.assign({}, this.searchArgs.options);

  options.previous = this;

  // retrieve next results with scroll if original search use it
  if (options.scrollId) {
    if (this.fetchedDocument >= this.total) {
      cb(null, null);
      return;
    }

    // from and size parameters are not valid for a scroll action
    if (options.from) {
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
        handleNextSearchResults(error, newSearchResults, cb);
      }
    );

    return;
  }

  // retrieve next results with from/size if original search use it
  if (options.from !== undefined && options.size !== undefined) {
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
        handleNextSearchResults(error, newSearchResults, cb);
      }
    );

    return;
  }

  cb(new Error('Unable to retrieve next results from search: missing scrollId or from/size params'));
};

/**
 * @param {Error} error
 * @param {KuzzleSearchResult} newSearchResults
 * @param {Function} cb
 */
function handleNextSearchResults (error, newSearchResults, cb) {
  if (error) {
    cb(error);
    return;
  }

  cb(null, newSearchResults);
}

module.exports = KuzzleSearchResult;
