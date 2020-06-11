const BaseController = require('./Base');

class BulkController extends BaseController {
  constructor (kuzzle) {
    super(kuzzle, 'bulk');
  }

  /**
  * Directly deletes every documents matching the search query without:
  *  - applying max documents write limit
  *  - fetching deleted documents
  *  - triggering realtime notifications
  * {@link https://docs.kuzzle.io/core/2/api/controllers/bulk/delete-by-query/|Official documentation}
  * @param {String} index - Index name
  * @param {String} collection - Collection name
  * @param {Object[]} query - Query matching documents to delete
  * @param {Object} [options] - Additional options
  * @returns {Promise}
  */
  deleteByQuery(index, collection, query = {}, options = {}) {
    const request = {
      index,
      collection,
      body: query,
      action: 'deleteByQuery'
    };

    return this.query(request, options)
      .then(response => response.result.deleted);
  }

  /**
   * Creates, updates or deletes large amounts of documents as fast as possible.
   * {@link https://docs.kuzzle.io/core/2/api/controllers/bulk/import/|Official documentation}
   *
   * @param {String} index - Index name
   * @param {String} collection - Collection name
   * @param {Object[]} bulkData - Array of documents detailing the bulk operations to perform, following ElasticSearch Bulk API
   * @param {Object} [options] - Additional options
   * @returns {Promise}
   */
  import (index, collection, bulkData, options = {}) {
    return this.query({
      index,
      collection,
      action: 'import',
      body: {
        bulkData
      }
    }, options)
      .then(response => response.result);
  }

  /**
   * Creates or replaces a document directly into the storage engine.
   * {@link https://docs.kuzzle.io/core/2/api/controllers/bulk/write/|Official documentation}
   *
   * @param {String} index - Index name
   * @param {String} collection - Collection name
   * @param {Object} document - Document body
   * @param {String} [id=null] - Document ID
   * @param {Object} [options] - Additional options (notify, refresh)
   * @returns {Promise}
   */
  write (index, collection, document, id = null, options = {}) {
    return this.query({
      index,
      collection,
      _id: id,
      action: 'write',
      body: document
    }, options)
      .then(response => response.result);
  }

  /**
   * Creates or replaces multiple documents directly into the storage engine.
   * {@link https://docs.kuzzle.io/core/2/api/controllers/bulk/m-write/|Official documentation}
   *
   * @param {String} index - Index name
   * @param {String} collection - Collection name
   * @param {Object[]} documents - Array of objects describing the documents with '_id' and '_source' properties
   * @param {Object} [options] - Additional options (notify, refresh)
   * @returns {Promise}
   */
  mWrite (index, collection, documents, options = {}) {
    return this.query({
      index,
      collection,
      action: 'mWrite',
      body: { documents }
    }, options)
      .then(response => response.result);
  }

}

module.exports = BulkController;
