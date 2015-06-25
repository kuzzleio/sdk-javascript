function Kuzzle(socketUrl) {

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
    var requestId = Math.uuid();

    // subscribe to feedback and map to callback function when receive a message :
    this.socket.once(requestId, function(response) {
      this.socket.off(response.result);
      this.socket.on(response.result, function(data){
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
   * @param {Boolean} persist
   * @param {Function} callback
   */
  this.update = function (collection, body, persist, callback) {
    this.write(collection, 'update', body, persist, callback);
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
}
