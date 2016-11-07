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
  this.dataCollection = dataCollection;
  this.total = total;
  this.documents = documents;
  this.searchArgs = searchArgs;
  this.previous = previous;

  return this;
}

/**
 *
 * @param {function} cb
 */
KuzzleSearchResult.prototype.getNext = function (cb) {
  var self = this;

  function handleScrollNext (error, result) {
    var
      documents = [],
      fetchedDocuments = self.documents.length,
      options = Object.assign({}, self.searchArgs.options),
      previous = self;

    if (error) {
      return cb(error);
    }

    while (previous = previous.previous) {
      fetchedDocuments += previous.documents.length;
    }
    console.log('fetchedDocuments', fetchedDocuments, self.total, fetchedDocuments >= self.total);

    if (fetchedDocuments >= self.total) {
      return cb(null, null);
    }

    result.result.hits.forEach(function (doc) {
      var newDocument = new KuzzleDocument(self.dataCollection, doc._id, doc._source);

      newDocument.version = doc._version;

      documents.push(newDocument);
    });

    if (result.result['_scroll_id']) {
      options.scrollId = result.result['_scroll_id'];
    }

    return cb(null, new KuzzleSearchResult(self.dataCollection, self.total, documents, {options: options, filters: self.searchArgs.filters}, self));
  }

  if (this.searchArgs.filters.scrollId) {
    return this.dataCollection.kuzzle.scroll(
      this.searchArgs.filters.scrollId,
      this.searchArgs.options || {},
      handleScrollNext
    )
  }
  else if (this.searchArgs.filters.from !== undefined && this.searchArgs.filters.size !== undefined) {
    var
      filters = Object.assign({}, this.searchArgs.filters);

    filters.from += filters.size;

    if (filters.from >= self.total) {
      return cb(null, null);
    }

    return this.dataCollection.search(filters, this.searchArgs.options, function (error, searchResults) {
      if (error) {
        return cb(error);
      }

      searchResults.previous = self;
      return cb(null, searchResults);
    })
  }

  throw new Error('Unable to retrieve next results from search: missing scrollId or from/size params')
};

KuzzleSearchResult.prototype.getPrevious = function () {
  return this.previous;
};


module.exports = KuzzleSearchResult;