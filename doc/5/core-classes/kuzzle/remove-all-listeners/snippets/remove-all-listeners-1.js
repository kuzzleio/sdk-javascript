// Removes all listeners on the "unsubscribed" global event
kuzzle.removeAllListeners('disconnected');

// Removes all listeners on all global events
kuzzle.removeAllListeners();
