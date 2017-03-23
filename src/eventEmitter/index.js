var NodeEmitter;

function EventEmitter(eventTimeout) {
  Object.defineProperties(this, {
    eventTimeout: {
      value: eventTimeout || 200,
      writeable: false
    }
  });

  if (typeof window !== 'undefined') {
    this._events = {};
    this._onceEvents = {};
  }
  this.removeAllListeners();
}

if (typeof window === 'undefined') {
  NodeEmitter = require('events');
  EventEmitter.prototype = new NodeEmitter();
} else {

  EventEmitter.prototype.on = function(eventName, listener) {
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
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.prependListener = function(eventName, listener) {
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

  EventEmitter.prototype.once = function(eventName, listener) {
    var onceListeners;

    if (!eventName || !listener) {
      return;
    }


    this.on(eventName, listener);
    onceListeners = this._onceEvents[eventName] = this._onceEvents[eventName] || {};
    onceListeners[listener] = true;

    return this;
  };

  EventEmitter.prototype.prependOnceListener = function(eventName, listener) {
    var onceListeners;

    if (!eventName || !listener) {
      return;
    }
    this.prependListener(eventName, listener);
    onceListeners = this._onceEvents[eventName] = this._onceEvents[eventName] || {};
    onceListeners[listener] = true;

    return this;
  };

  EventEmitter.prototype.removeListener = function(eventName, listener) {
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

  EventEmitter.prototype.removeAllListeners = function(eventName) {
    if (eventName) {
      delete this._events[eventName];
      delete this._onceEvents[eventName];
    } else {
      this._events = [];
      this._onceEvents = [];
    }

    return this;
  };

  EventEmitter.prototype.emit = function(eventName) {
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

  EventEmitter.prototype.eventNames = function () {
    return Object.keys(this._events);
  };

  EventEmitter.prototype.listenerCount = function (eventName) {
    return this._events[eventName] && this._events[eventName].length || 0;
  };

  EventEmitter.prototype.listeners = function (eventName) {
    if (this._events[eventName] === undefined) {
      this._events[eventName] = [];
    }
    return this._events[eventName];
  };

}
// Aliases:
EventEmitter.prototype.emitEvent = EventEmitter.prototype.emit;
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

module.exports = EventEmitter;
