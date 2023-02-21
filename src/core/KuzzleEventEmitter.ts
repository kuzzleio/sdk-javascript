import { KuzzleError } from "../KuzzleError";
import { Notification, RequestPayload } from "../types";

class Listener {
  public fn: (...any) => any;
  public once: boolean;

  constructor(fn, once = false) {
    this.fn = fn;
    this.once = once;
  }
}

export type KuzzleSDKEvents =
  | "connected"
  | "reconnected"
  | "tokenExpired"
  | "loginAttempt"
  | "discarded"
  | "disconnected"
  | "networkError"
  | "offlineQueuePop"
  | "offlineQueuePush"
  | "queryError"
  | "callbackError";
/**
 * @todo proper TS conversion
 */
export class KuzzleEventEmitter {
  private _events: Map<string, Array<Listener>>;

  constructor() {
    this._events = new Map();
  }

  private _exists(listeners, fn) {
    return Boolean(listeners.find((listener) => listener.fn === fn));
  }

  listeners(eventName: KuzzleSDKEvents) {
    if (!this._events.has(eventName)) {
      return [];
    }

    return this._events.get(eventName).map((listener) => listener.fn);
  }

  addListener(eventName: KuzzleSDKEvents, listener, once = false) {
    if (!eventName || !listener) {
      return this;
    }

    const listenerType = typeof listener;

    if (listenerType !== "function") {
      throw new Error(
        `Invalid listener type: expected a function, got a ${listenerType}`
      );
    }

    if (!this._events.has(eventName)) {
      this._events.set(eventName, []);
    }

    if (!this._exists(this._events.get(eventName), listener)) {
      this._events.get(eventName).push(new Listener(listener, once));
    }

    return this;
  }

  on(
    eventName: "connected" | "reconnected" | "tokenExpired",
    listener: () => void
  ): this;
  on(
    eventName: "loginAttempt",
    listener: (data: { success: boolean; error: string }) => void
  ): this;
  on(eventName: "discarded", listener: (request: RequestPayload) => void): this;
  on(
    eventName: "disconnected",
    listener: (context: {
      origin:
        | "websocket/auth-renewal"
        | "user/connection-closed"
        | "network/error";
    }) => void
  ): this;
  on(
    eventName: "networkError",
    listener: (error: {
      message: string;
      status: number;
      stack?: string;
    }) => void
  ): this;
  on(
    eventName: "offlineQueuePop",
    listener: (request: RequestPayload) => void
  ): this;
  on(
    eventName: "offlineQueuePush",
    listener: (data: { request: RequestPayload }) => void
  ): this;
  on(
    eventName: "queryError",
    listener: (data: { error: KuzzleError; request: RequestPayload }) => void
  ): this;
  on(
    eventName: "callbackError",
    listener: (data: { error: KuzzleError; notification: Notification }) => void
  ): this;
  on(eventName: KuzzleSDKEvents, listener: (args: any) => void): this {
    return this.addListener(eventName, listener);
  }

  prependListener(eventName, listener, once = false) {
    if (!eventName || !listener) {
      return this;
    }

    if (!this._events.has(eventName)) {
      this._events.set(eventName, []);
    }

    if (!this._exists(this._events.get(eventName), listener)) {
      const listeners = [new Listener(listener, once)].concat(
        this._events.get(eventName)
      );

      this._events.set(eventName, listeners);
    }

    return this;
  }

  addOnceListener(eventName, listener) {
    return this.addListener(eventName, listener, true);
  }

  once(eventName, listener) {
    return this.addOnceListener(eventName, listener);
  }

  prependOnceListener(eventName, listener) {
    return this.prependListener(eventName, listener, true);
  }

  removeListener(eventName: KuzzleSDKEvents, listener: (args: any) => void) {
    const listeners = this._events.get(eventName);

    if (!listeners || !listeners.length) {
      return this;
    }

    const index = listeners.findIndex((l) => l.fn === listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      this._events.delete(eventName);
    }

    return this;
  }

  removeAllListeners(eventName?: KuzzleSDKEvents) {
    if (eventName) {
      this._events.delete(eventName);
    } else {
      this._events = new Map();
    }

    return this;
  }

  emit(eventName: KuzzleSDKEvents, ...payload: (Error | RequestPayload)[]) {
    const listeners = this._events.get(eventName);

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

  eventNames() {
    return Array.from(this._events.keys());
  }

  listenerCount(eventName: KuzzleSDKEvents) {
    return (
      (this._events.has(eventName) && this._events.get(eventName).length) || 0
    );
  }
}

module.exports = { KuzzleEventEmitter };
