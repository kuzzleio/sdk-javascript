var
  uuid = require('uuid');

function EventEmitter(eventTimeout) {
  Object.defineProperties(this, {
    eventListeners: {
      value: {}
    },
    eventTimeout: {
      value: eventTimeout || 200,
      writeable: false
    }
  });
}

/**
 * Emit an event to all registered listeners
 * An event cannot be emitted multiple times before a timeout has been reached.
 */
EventEmitter.prototype.emitEvent = function emitEvent(event) {
  var
    self = this,
    now = Date.now(),
    args = Array.prototype.slice.call(arguments, 1),
    eventProperties = this.eventListeners[event];

  if (!eventProperties) {
    return false;
  }

  if (eventProperties.lastEmitted && eventProperties.lastEmitted >= now - this.eventTimeout) {
    return false;
  }

  eventProperties.listeners.forEach(function (listener) {
    setTimeout(function () {
      if (listener.once) {
        self.removeListener(event, listener.id);
      }
      listener.fn.apply(undefined, args);
    }, 0);
  });

  // Events without the 'lastEmitted' property can be emitted without minimum time between emissions
  if (eventProperties.lastEmitted !== undefined) {
    eventProperties.lastEmitted = now;
  }
};


/**
 * Adds a listener to a Kuzzle global event. When an event is fired, listeners are called in the order of their
 * insertion.
 *
 * The ID returned by this function is required to remove this listener at a later time.
 *
 * @param {string} event - name of the global event to subscribe to (see the 'eventListeners' object property)
 * @param {function} listener - callback to invoke each time an event is fired
 * @param {boolean} once - true if the listener should be triggered only once and then removed.
 * @returns {string} Unique listener ID
 */
EventEmitter.prototype.addListener = function(event, listener, once) {
  var
    listenerType = typeof listener,
    listenerId;

  if (listenerType !== 'function') {
    throw new Error('Invalid listener type: expected a function, got a ' + listenerType);
  }

  if (!this.eventListeners[event]) {
    this.eventListeners[event] = {listeners: []};
  }

  listenerId = uuid.v4();

  this.eventListeners[event].listeners.push({id: listenerId, fn: listener, once: (once === true)});
  return listenerId;
};

/**
 * Removes a listener from an event.
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 * @param {function} fn - callback to match the listener
 * @returns {string} the listener ID
 */
EventEmitter.prototype.getListener = function (event, fn) {
  var
    listenerType = typeof fn,
    listenerId = false;

  if (!this.eventListeners[event || fn === undefined]) {
    return false;
  }

  if (listenerType !== 'function') {
    throw new Error('Invalid listener type: expected a function, got a ' + listenerType);
  }

  this.eventListeners[event].listeners.forEach(function (listener) {
    if (listener.fn === fn) {
      listenerId = listener.id;
    }
  });

  return listenerId;
};

/**
 * Removes a listener from an event.
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 * @param {string} listenerId - The ID returned by addListener
 * @returns {EventEmitter} this object
 */
EventEmitter.prototype.removeListener = function (event, listenerId) {
  var
    self = this,
    knownEvents = Object.keys(this.eventListeners);

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  this.eventListeners[event].listeners.forEach(function (listener, index) {
    if (listener.id === listenerId) {
      self.eventListeners[event].listeners.splice(index, 1);
    }
  });

  return self;
};

/**
 * Removes all listeners, either from a specific event or from all events
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 * @returns {EventEmitter} this object
 */
EventEmitter.prototype.removeAllListeners = function (event) {
  var
    self = this,
    knownEvents = Object.keys(this.eventListeners);

  if (event) {
    if (knownEvents.indexOf(event) === -1) {
      throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
    }

    this.eventListeners[event].listeners = [];
  } else {
    knownEvents.forEach(function (eventName) {
      self.eventListeners[eventName].listeners = [];
    });
  }

  return self;
};

module.exports = EventEmitter;
