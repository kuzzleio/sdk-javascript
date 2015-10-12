/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
 */


/**
 *  When creating a new data collection in the persistent data storage layer, Kuzzle uses a default mapping.
 *  It means that, by default, you won’t be able to exploit the full capabilities of our persistent data storage layer
 *  (currently handled by ElasticSearch), and your searches may suffer from below-average performances, depending on
 *  the amount of data you stored in a collection and the complexity of your database.
 *
 *  The KuzzleDataMapping object allow to get the current mapping of a data collection and to modify it if needed.
 *
 * @param {object} kuzzleDataCollection - Instance of the inherited KuzzleDataCollection object
 * @constructor
 */
function KuzzleDataMapping(kuzzleDataCollection) {
  Object.defineProperties(this, {
    //read-only properties
    collection: {
      value: kuzzleDataCollection.collection,
      eunmerable: true
    },
    kuzzle: {
      value: kuzzleDataCollection.kuzzle,
      enumerable: true
    },
    // writable properties
    mapping: {
      value: {},
      enumerable: true,
      writable: true
    }
  });
}

/**
 * Applies the new mapping to the data collection.
 *
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleDataMapping.prototype.apply = function (cb) {
  this.kuzzle.query(this.collection, 'admin', 'putMapping', {body: {properties: this.mapping}}, cb);

  return this;
};


module.exports = KuzzleDataMapping;
