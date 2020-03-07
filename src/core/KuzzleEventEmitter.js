class Listener {
  constructor(fn, once = false) {
    this.fn = fn;
    this.once = once;
  }
}

class KuzzleEventEmitter {
  constructor() {
    Reflect.defineProperty(this, '_events', {
      writable: true,
      enumerable: false,
      value: {}
    });
  }

  _exists (listeners, fn) {
    return Boolean(listeners.find(listener => listener.fn === fn));
  }

  listeners (eventName) {
    if (this._events[eventName] === undefined) {
      return [];
    }

    return this._events[eventName].map(listener => listener.fn);
  }

  addListener (eventName, listener, once = false) {
    if (!eventName || !listener) {
      return this;
    }

    const listenerType = typeof listener;

    if (listenerType !== 'function') {
      throw new Error(`Invalid listener type: expected a function, got a ${listenerType}`);
    }

    if (this._events[eventName] === undefined) {
      this._events[eventName] = [];
    }

    if (!this._exists(this._events[eventName], listener)) {
      this._events[eventName].push(new Listener(listener, once));
    }

    return this;
  }

  on (eventName, listener) {
    return this.addListener(eventName, listener);
  }

  prependListener (eventName, listener, once = false) {
    if (!eventName || !listener) {
      return this;
    }

    if (this._events[eventName] === undefined) {
      this._events[eventName] = [];
    }

    if (!this._exists(this._events[eventName], listener)) {
      this._events[eventName] = [new Listener(listener, once)].concat(this._events[eventName]);
    }

    return this;
  }

  addOnceListener (eventName, listener) {
    return this.addListener(eventName, listener, true);
  }

  once (eventName, listener) {
    return this.addOnceListener(eventName, listener);
  }

  prependOnceListener (eventName, listener) {
    return this.prependListener(eventName, listener, true);
  }

  removeListener (eventName, listener) {
    const listeners = this._events[eventName];

    if (!listeners || !listeners.length) {
      return this;
    }

    const index = listeners.findIndex(l => l.fn === listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      delete this._events[eventName];
    }

    return this;
  }

  removeAllListeners (eventName) {
    if (eventName) {
      delete this._events[eventName];
    } else {
      this._events = {};
    }

    return this;
  }

  emit (eventName, ...payload) {
    const listeners = this._events[eventName];

    if (listeners === undefined) {
      return false;
    }

    const onceListeners = [];

    for (const listener of listeners) {
      listener.fn(...payload);

      if (listener.once) {
        onceListeners.push(listener.fn);
      }
    }

    for (const toDelete of onceListeners) {
      this.removeListener(eventName, toDelete);
    }

    return true;
  }

  eventNames () {
    return Object.keys(this._events);
  }

  listenerCount (eventName) {
    return this._events[eventName] && this._events[eventName].length || 0;
  }
}

module.exports = KuzzleEventEmitter;
