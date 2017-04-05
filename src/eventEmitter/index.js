function KuzzleEventEmitter() {
  if (typeof window !== 'undefined') {
    this._events = {};
    this._onceEvents = {};
  }
}

if (typeof window === 'undefined') {
  KuzzleEventEmitter.prototype = require('events').prototype;
  KuzzleEventEmitter.prototype.constructor = KuzzleEventEmitter;
} else {

  KuzzleEventEmitter.prototype.on = function(eventName, listener) {
    var
      listenerType = typeof listener,
      listeners;

    if (!eventName || !listener) {
      return;
    }

    if (listenerType !== 'function') {
      throw new Error('Invalid listener type: expected a function, got a ' + listenerType);
    }

    listeners = this.listeners(eventName);
    // only add once
    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener);
    }

    // Handles `newListener` event (see https://nodejs.org/api/events.html#events_event_newlistener)
    this.emit('newListener', eventName, listener);

    return this;
  };
  KuzzleEventEmitter.prototype.addListener = KuzzleEventEmitter.prototype.on;

  KuzzleEventEmitter.prototype.prependListener = function(eventName, listener) {
    var listeners;

    if (!eventName || !listener) {
      return;
    }

    listeners = this.listeners(eventName);
    // only add once
    if (listeners.indexOf(listener) === -1) {
      this._events[eventName] = new Array(listener).concat(listeners);
    }

    // Handles `newListener` event (see https://nodejs.org/api/events.html#events_event_newlistener)
    this.emit('newListener', eventName, listener);

    return this;
  };

  KuzzleEventEmitter.prototype.once = function(eventName, listener) {
    var onceListeners;

    if (!eventName || !listener) {
      return;
    }


    this.on(eventName, listener);
    onceListeners = this._onceEvents[eventName] = this._onceEvents[eventName] || {};
    onceListeners[listener] = true;

    return this;
  };

  KuzzleEventEmitter.prototype.prependOnceListener = function(eventName, listener) {
    var onceListeners;

    if (!eventName || !listener) {
      return;
    }
    this.prependListener(eventName, listener);
    onceListeners = this._onceEvents[eventName] = this._onceEvents[eventName] || {};
    onceListeners[listener] = true;

    return this;
  };

  KuzzleEventEmitter.prototype.removeListener = function(eventName, listener) {
    var
      index,
      listeners = this._events[eventName];

    if (!listeners || !listeners.length) {
      return;
    }

    index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    if (listeners.length === 0) {
      delete this._events[eventName];
    }

    // Handles `removeListener` event (see https://nodejs.org/api/events.html#events_event_removeListener)
    this.emit('removeListener', eventName, listener);

    return this;
  };

  KuzzleEventEmitter.prototype.removeAllListeners = function(eventName) {
    if (eventName) {
      delete this._events[eventName];
      delete this._onceEvents[eventName];
    } else {
      this._events = [];
      this._onceEvents = [];
    }

    return this;
  };

  KuzzleEventEmitter.prototype.emit = function(eventName) {
    var
      i = 0,
      listeners,
      args,
      onceListeners,
      notifyList;

    listeners = this._events && this._events[eventName];

    if (!listeners || !listeners.length) {
      return;
    }

    args = Array.prototype.slice.call(arguments, 1);
    // once stuff
    onceListeners = this._onceEvents && this._onceEvents[eventName] || {};

    notifyList = new Array();

    listener = listeners[i];
    while (listener) {
      // trigger listener
      notifyList.push(listener);
      // get next listener
      if (onceListeners[listener]) {
        // remove listener
        this.removeListener(eventName,listener);
        // unset once flag
        delete onceListeners[listener];
      } else {
        i++;
      }
      listener = listeners[i];
    }
    for (item in notifyList) {
      // trigger listener
      if (notifyList[item] !== undefined) {
        notifyList[item].apply(this, args);
      }
    }

    return this;
  };

  KuzzleEventEmitter.prototype.eventNames = function () {
    return Object.keys(this._events);
  };

  KuzzleEventEmitter.prototype.listenerCount = function (eventName) {
    return this._events[eventName] && this._events[eventName].length || 0;
  };

  KuzzleEventEmitter.prototype.listeners = function (eventName) {
    if (this._events[eventName] === undefined) {
      this._events[eventName] = [];
    }
    return this._events[eventName];
  };

}
// Aliases:
KuzzleEventEmitter.prototype.emitEvent = KuzzleEventEmitter.prototype.emit;
KuzzleEventEmitter.prototype.off = KuzzleEventEmitter.prototype.removeListener;

module.exports = KuzzleEventEmitter;
