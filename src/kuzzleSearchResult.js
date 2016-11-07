var KuzzleDocument = require('./kuzzleDocument.js');

/**
 *
 * @param {KuzzleDataCollection} dataCollection
 * @param {int} total
 * @param {KuzzleDocument[]} documents
 * @param {object} searchArgs
 * @param {KuzzleSearchResult} [previous]
 * @constructor
 */
function KuzzleSearchResult (dataCollection, total, documents, searchArgs, previous) {
  Object.defineProperties(this, {
    // read-only properties
    dataCollection: {
      value: dataCollection,
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
    searchArgs: {
      value: searchArgs,
      enumerable: true
    },
    // writable properties
    _previous: {
      value: previous || null,
      enumerable: true,
      writable: true
    },
    _next: {
      value: null,
      enumerable: true,
      writable: true
    }
  });

  if (this._previous instanceof KuzzleSearchResult) {
    this._previous._next = this;
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
  if (cb) {
    cb(null, this._previous);

    return this;
  }

  return this._previous;
};

/**
 * @param {function} cb
 */
KuzzleSearchResult.prototype.next = function (cb) {
  var self = this;

  /**
   * @param error
   * @param result
   */
  function handleScrollNext (error, result) {
    var
      documents = [],
      options = Object.assign({}, self.searchArgs.options);

    if (error) {
      cb(error);
      return void 0;
    }

    result.result.hits.forEach(function (doc) {
      var newDocument = new KuzzleDocument(self.dataCollection, doc._id, doc._source);

      newDocument.version = doc._version;

      documents.push(newDocument);
    });

    if (result.result['_scroll_id']) {
      options.scrollId = result.result['_scroll_id'];
    }

    self._next = new KuzzleSearchResult(self.dataCollection, self.total, documents, {options: options, filters: self.searchArgs.filters}, self);

    cb(null, self._next);
  }

  /**
   * @param error
   * @param searchResults
   */
  function handleFromSizeNext (error, searchResults) {
    if (error) {
      cb(error);
      return void 0;
    }

    searchResults._previous = self;
    self._next = searchResults;

    cb(null, self._next);
  }

  if (!this._next) {
    // retrieve next results with scroll if original search use it
    if (this.searchArgs.filters.scrollId) {
      var
        fetchedDocuments = this.documents.length,
        previous = this;

      // check if we need to scroll again to fetch all matching documents
      while (previous = previous.previous()) {
        fetchedDocuments += previous.documents.length;
      }

      if (fetchedDocuments >= this.total) {
        cb(null, null);
        return this;
      }

      this.dataCollection.kuzzle.scroll(
        this.searchArgs.filters.scrollId,
        this.searchArgs.options || {},
        handleScrollNext
      );

      return this;
    }
    // retrieve next results with  from/size if original search use it
    else if (this.searchArgs.filters.from !== undefined && this.searchArgs.filters.size !== undefined) {
      var
        filters = Object.assign({}, this.searchArgs.filters);

      // check if we need to do next request to fetch all matching documents
      filters.from += filters.size;

      if (filters.from >= self.total) {
        cb(null, null);

        return this;
      }

      this.dataCollection.search(
        filters,
        this.searchArgs.options,
        handleFromSizeNext
      );

      return this;
    }
  }

  if (this._next instanceof KuzzleSearchResult) {
    cb(null, this._next);

    return this;
  }

  cb(new Error('Unable to retrieve next results from search: missing scrollId or from/size params'));
};


module.exports = KuzzleSearchResult;