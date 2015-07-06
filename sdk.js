function Kuzzle(socketUrl) {
  var
    subscribedRooms = {};
  
  if (!socketUrl || socketUrl === '') {
    console.error('Url to Kuzzle can\'t be empty');
    return false;
  }

  if (!(this instanceof Kuzzle)) {
    return new Kuzzle(socketUrl);
  }

  this.socket = io(socketUrl);

  /**
   * Subscribe to a filter
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  this.subscribe = function(collection, filters, callback) {
    var roomId = Math.uuid();

    // subscribe to feedback and map to callback function when receive a message :
    this.socket.once(roomId, function(response) {
      subscribedRooms[roomId] = response.result;
      this.socket.off(response.result);
      this.socket.on(response.result, function(data){
        callback(data);
      });
    }.bind(this));

    // create the feedback room :
    this.socket.emit('subscribe', {
      requestId: roomId,
      action: 'on',
      collection: collection,
      body: filters
    });

    return roomId;
  };

  /**
   * Unsubscribe to a room
   * @param {String} roomId
   */
  this.unsubscribe = function(roomId) {
    if (!subscribedRooms[roomId]) {
      return false;
    }
    
    // Unsubscribes from Kuzzle & closes the socket
    this.socket.emit('subscribe', {
      requestId: roomId,
      action: 'off'
    });
    
    this.socket.off(subscribedRooms[roomId]);
    
    delete subscribedRooms[roomId];
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

    if (callback) {
      this.socket.once(requestId, function(response) {
        callback(response);
      });
    }

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
   * Shortcut for access to the write controller and create a new document
   * @param {String} collection
   * @param {Object} body
   * @param {Boolean} persist
   * @param {Function} callback
   */
  this.create = function (collection, body, persist, callback) {
    this.write(collection, 'create', body, persist, callback);
  };

  /**
   * Shortcut for access to the write controller and update a new document
   * @param {String} collection
   * @param {Object} body
   * @param {Function} callback
   */
  this.update = function (collection, body, callback) {
    this.write(collection, 'update', body, true, callback);
  };

  /**
   * Shortcut for access to the write controller and delete a document by its id
   * @param {String} collection
   * @param {Object} id
   * @param {Function} callback
   */
  this.delete = function (collection, id, callback) {
    var body = {
      _id: id
    };

    this.write(collection, 'delete', body, true, callback);
  };

  /**
   * Shortcut for access to the write controller and delete documents by query
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  this.deleteByQuery = function (collection, filters, callback) {
    this.write(collection, 'deleteByQuery', filters, true, callback);
  };

  /**
   * Search document from Kuzzle according to a filter
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  this.search = function(collection, filters, callback) {
    var requestId = Math.uuid();

    this.socket.once(requestId, function(response) {
      callback(response);
    });

    this.socket.emit('read', {
      requestId: requestId,
      action: 'search',
      collection: collection,
      body: filters
    });
  };

  /**
   * Get specific document from Kuzzle by id
   * @param {String} collection
   * @param {String} id
   * @param {Function} callback
   */
  this.get = function (collection, id, callback) {
    var requestId = Math.uuid();

    this.socket.once(requestId, function(response) {
      callback(response);
    });

    this.socket.emit('read', {
      requestId: requestId,
      action: 'get',
      collection: collection,
      _id: id
    });
  };

  /**
   * Count document from Kuzzle for a specific filter
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  this.count = function (collection, filters, callback) {
    var requestId = Math.uuid();

    this.socket.once(requestId, function(response) {
      callback(response);
    });

    this.socket.emit('read', {
      requestId: requestId,
      action: 'count',
      collection: collection
    });
  };
}
