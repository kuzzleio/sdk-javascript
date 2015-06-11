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
    this.socket.once(requestId, function(result) {
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
   * @param {Function} callback
   */
  this.write = function(collection, action, body, persist, callback) {
    var requestId = Math.uuid();

    this.socket.once(requestId, function(result) {
      if (result.error) {
        console.error(result.error);
        return false;
      }

      if (callback) {
        callback(result);
      }
    });

    if (persist === undefined) {
      persist = false;
    }

    this.socket.emit('write', {
      requestId: requestId,
      action: action,
      persist: persist,
      collection: collection,
      body: body
    });
  };

  /**
   * Search document from ES according to a filter
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  this.search = function(collection, filters, callback) {
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
  };

  this.get = function (collection, id, callback) {
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
      action: 'get',
      collection: collection,
      id: id
    });
  }
}
