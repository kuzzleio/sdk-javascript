(function (root, factory) {

// as webrowser AMD/RequireJS module
if (typeof define === 'function' && define.amd) {
  define(['socket.io'], factory);
}
// as Node.js common.js module
else if (typeof module === 'object' && module.exports) {
  module.exports = factory(require('socket.io-client'));
}
// as <script src="path/to/kuzzle/kuzzle.js"></script>
else {
  if(typeof io == "undefined"){
    console.log("Socketio dependency for Kuzzle not found. ");
    console.log("maybe you have to had something like : " + '<script src="path/to/socket.io-1.3.4.js"></script>   ?');
  }
  root.Kuzzle = factory(io);
}

}(this, function(io) {

  if(typeof io == "undefined"){
    if (typeof define === 'function' && define.amd) {
      console.log("io dependency not found, maybe something wrong with you require path configuration ?");
    }
    // as Node.js common.js module
    else if (typeof module === 'object' && module.exports) {
      console.log("something wrong with socketio dependency ");
    }
  }
   
/*
 * !This is from Math.uuid.js (v1.4), all credits go to robert@broofa.com
 * !http://www.broofa.com
 */
var UUID = (function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  return function (len, radix) {
    var chars = CHARS, uuid = [], i;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

})();


var Kuzzle = {
  socket : null,
  subscribedRooms: [],
  bucket: {},
  init: function (socketUrl) {
    if (this.socket) {
      return this;
    }

    if (!socketUrl || socketUrl === '') {
      console.error('Url to Kuzzle can\'t be empty');
      return false;
    }

    this.socket = io(socketUrl);
    return this;
  },

  /**
   * Subscribe to a filter
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  subscribe: function(collection, filters, callback) {
    var roomName = UUID();


    // subscribe to feedback and map to callback function when receive a message :
    this.socket.once(roomName, function(response) {
      this.subscribedRooms[roomName] = response.result.roomId;
      this.socket.off(response.result.roomId);
      this.socket.on(response.result.roomId, function(data){
        callback(data.error, data.result);
      });
    }.bind(this));

    // create the feedback room :
    this.socket.emit('subscribe', {
      requestId: roomName,
      action: 'on',
      collection: collection,
      body: filters
    });

    return roomName;
  },

  /**
   * Unsubscribe to a room
   * @param {String} roomName
   */
  unsubscribe: function(roomName) {
    if (!this.subscribedRooms[roomName]) {
      return false;
    }
    
    // Unsubscribes from Kuzzle & closes the socket
    this.socket.emit('subscribe', {
      requestId: roomName,
      action: 'off'
    });
    
    this.socket.off(this.subscribedRooms[roomName]);
    
    delete this.subscribedRooms[roomName];
  },

  /**
   * Count subscription to a room
   * @param {String} roomName
   * @param {Function} callback
   */
  countSubscription: function (roomName, callback) {
    var requestId = UUID();

    if (callback) {
      this.socket.once(requestId, function(response) {
        callback(response.error, response.result);
      });
    }

    this.socket.emit('subscribe', {
      requestId: requestId,
      action: 'count',
      body: {
        roomId: this.subscribedRooms[roomName]
      }
    });
  },

  /**
   * Write message to kuzzle
   * @param {String} collection
   * @param {String} action
   * @param {Object} body
   * @param {Boolean} persist
   * @param {Function} callback
   */
  write: function(collection, action, body, persist, callback) {
    var requestId = UUID();

    if (callback) {
      this.socket.once(requestId, function(response) {
        callback(response.error, response.result);
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
  },

  /**
   * Send bulk action message to kuzzle
   * @param {String} collection
   * @param {Object} body
   * @param {Function} callback
   */
  bulk: function(collection, body, callback) {
    var requestId = UUID();

    if (callback) {
      this.socket.once(requestId, function(response) {
        callback(response.error, response.result);
      });
    }

    this.socket.emit('bulk', {
      requestId: requestId,
      action: 'import',
      persist: true,
      collection: collection,
      body: body
    });
  },

  /**
   * Send admin action message to kuzzle
   * @param {String} collection
   * @param {String} action
   * @param {Object} body
   * @param {Function} callback
   */
  admin: function(collection, action, body, callback) {
    var requestId = UUID();

    if (callback) {
      this.socket.once(requestId, function(response) {
        callback(response.error, response.result);
      });
    }

    this.socket.emit('admin', {
      requestId: requestId,
      action: action,
      collection: collection,
      body: body
    });
  },

  /**
   * Shortcut for access to the admin controller and put a mapping to a collection
   * @param {String} collection
   * @param {Object} body
   * @param {Function} callback
   */
  putMapping: function (collection, body, callback) {
    this.admin(collection, 'putMapping', body, callback);
  },

  /**
   * Shortcut for access to the write controller and create a new document
   * @param {String} collection
   * @param {Object} body
   * @param {Boolean} persist
   * @param {Function} callback
   */
  create: function (collection, body, persist, callback) {
    this.write(collection, 'create', body, persist, callback);
  },

  /**
   * Shortcut for access to the write controller and update a new document
   * @param {String} collection
   * @param {Object} body
   * @param {Function} callback
   */
  update: function (collection, body, callback) {
    this.write(collection, 'update', body, true, callback);
  },

  /**
   * Shortcut for access to the write controller and delete a document by its id
   * @param {String} collection
   * @param {Object} id
   * @param {Function} callback
   */
  delete: function (collection, id, callback) {
    var body = {
      _id: id
    };

    this.write(collection, 'delete', body, true, callback);
  },

  /**
   * Shortcut for access to the write controller and delete documents by query
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  deleteByQuery: function (collection, filters, callback) {
    this.write(collection, 'deleteByQuery', filters, true, callback);
  },

  /**
   * Search document from Kuzzle according to a filter
   * @param {String} collection
   * @param {Object} data
   * @param {Function} callback
   */
  search: function(collection, data, callback) {
    this.readWithQuery(collection, data, 'search', callback);
  },

  /**
   * Get specific document from Kuzzle by id
   * @param {String} collection
   * @param {String} id
   * @param {Function} callback
   */
  get: function (collection, id, callback) {
    var requestId = UUID();

    this.socket.once(requestId, function(response) {
      callback(response.error, response.result);
    });

    this.socket.emit('read', {
      requestId: requestId,
      action: 'get',
      collection: collection,
      _id: id
    });
  },

  /**
   * Count document from Kuzzle for a specific filter
   * @param {String} collection
   * @param {Object} filters
   * @param {Function} callback
   */
  count: function (collection, filters, callback) {
    var requestId = UUID();

    this.socket.once(requestId, function(response) {
      callback(response.error, response.result);
    });

    this.socket.emit('read', {
      requestId: requestId,
      action: 'count',
      collection: collection,
      body: filters
    });
  },

  readWithQuery: function (collection, data, action, callback) {
    var requestId = UUID();

    this.socket.once(requestId, function(response) {
      callback(response.error, response.result);
    });

    var object = {
      requestId: requestId,
      action: action,
      collection: collection
    };

    if (Object.keys(data).length > 1) {
      var attr;

      for(attr in data) {
        if (data.hasOwnProperty(attr)) {
          object[attr] = data[attr];
        }
      }
    }
    else {
      object.body = data;
    }
    this.socket.emit('read', object);
  },

 /**
   * Prepare a bulk query
   * If action is 'delete', data *must* be the document _id
   * @param {String} collection
   * @param {String} action
   * @param {Object} data
   */

  prepare: function(collection, action, data) {
    var bag;
    switch(action) {
      case 'write':
      case 'insert':
      case 'create':
        bag = [{create: {}}];
        bag.push(data);
        break;
      case 'update':
        bag = [{update: {_retry_on_conflict: 3}}];
        bag.push(data);
        break;
       case 'delete':
         bag = [{delete: {_id: data}}];
         break;
    }
    
    if (!this.bucket[collection]) {
      this.bucket[collection] = bag;
    } else {
      this.bucket[collection] = this.bucket[collection].concat(bag);
    }
  },
/**
   * Send a bulk query for the given collection
   * @param {String} collection
   * @param {Function} callback
   */

  commit: function(collection, callback) {
    if (this.bucket[collection]) {
      var bag = JSON.parse(JSON.stringify(this.bucket[collection]));
      delete this.bucket[collection];
      this.bulk(collection, bag, function(response) {
        response.bulkBody = bag;
        if (callback) {
          callback(response.error, response.result);
        }
      });
    } else {
      var response = {
        error: null,
        response: {
          status: 'no prepared query for "' + collection + '" collection'
        }
      };
      if (callback) {
        callback(response.error, response.result);
      }
    }
  },


  /**
   * close socket connection, close Kuzzle
   */
  close: function(){
    this.socket.close();
  }
};

return Kuzzle;
}));
