function kuzzleSDK(socketUrl) {
  if (!(this instanceof kuzzleSDK)) {
    return new kuzzleSDK(socketUrl);
  }

  this.socket = io(socketUrl);

  this.subscribe = function(collection, filters, callback) {
    var requestId = Math.round(Math.random() * Date.now());

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
      content: filters
    });
  };

  // write a message to kuzzle :
  this.write = function(collection, action, content, persist) {
    if (persist === undefined) {
      persist = false;
    }

    var msg = { action: action,
      persist: persist,
      collection: collection,
      content: content };
    this.socket.emit('write', msg );
  };

}
