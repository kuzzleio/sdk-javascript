function kuzzleSDK(socketUrl) {
  if (!(this instanceof kuzzleSDK)) {
    return new kuzzleSDK(socketUrl);
  }

  this.socket = io(socketUrl);

  /**
   * Subscribe to a filter
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  this.subscribe = function(collection, filters, callback) {
    var requestId = Math.uuid();

    // subscribe to feedback and map to callback function when receive a message :
    this.socket.once(requestId, function(result){
      if (result.error) {
        console.error(result.error);
        return false;
      }
      this.socket.off(result);
      this.socket.on(result, function(data){
        callback(data);
      });
    }.bind(this));

    // create the feedback room :
    this.socket.emit('subscribe', {
      requestId: requestId,
      action: 'on',
      collection: collection,
      body: filters
    });
  };

  /**
   * Write message to kuzzle
   * @param {String} collection
   * @param {String} action
   * @param {Object} body
   * @param {Boolean} persist
   */
  this.write = function(collection, action, body, persist) {
    if (persist === undefined) {
      persist = false;
    }

    var msg = { action: action,
      persist: persist,
      collection: collection,
      body: body };
    this.socket.emit('write', msg );
  };

  /**
   * Read document from ES according to a filter
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  this.read = function(collection, filters, callback) {
    var requestId = Math.uuid();

    this.socket.once(requestId, function(result) {
      if (result.error) {
        console.error(result.error);
        return false;
      }

      callback(result);
    });

    this.socket.emit('read', {
      requestId: requestId,
      action: 'search',
      collection: collection,
      body: filters
    });
  }
}
