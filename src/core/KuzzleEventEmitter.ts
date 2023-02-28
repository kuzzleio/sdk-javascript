import { DisconnectionOrigin } from "../protocols/DisconnectionOrigin";
import { KuzzleError } from "../KuzzleError";
import { Notification, RequestPayload } from "../types";

type ListenerFunction = (...args: unknown[]) => unknown;
class Listener {
  public fn: ListenerFunction;
  public once: boolean;

  constructor(fn, once = false) {
    this.fn = fn;
    this.once = once;
  }
}

export type KuzzleSDKEvents =
  | "connect"
  | "reconnect"
  | "connected"
  | "reconnected"
  | "reAuthenticated"
  | "tokenExpired"
  | "loginAttempt"
  | "discarded"
  | "disconnect"
  | "disconnected"
  | "networkError"
  | "queryError"
  | "reconnectionError"
  | "callbackError"
  | "offlineQueuePop"
  | "offlineQueuePush"
  | "logoutAttempt"
  | "websocketRenewalStart"
  | "websocketRenewalDone";
/**
 * @todo proper TS conversion
 */
export class KuzzleEventEmitter {
  private _events: Map<string, Array<Listener>>;

  constructor() {
    this._events = new Map();
  }

  private _exists(listeners: Listener[], fn: ListenerFunction) {
    return Boolean(listeners.find((listener) => listener.fn === fn));
  }

  listeners(eventName: KuzzleSDKEvents) {
    if (!this._events.has(eventName)) {
      return [];
    }

    return this._events.get(eventName).map((listener) => listener.fn);
  }

  addListener(
    eventName: KuzzleSDKEvents,
    listener: ListenerFunction,
    once = false
  ) {
    if (!eventName || !listener) {
      return this;
    }

    // TODO: this check could be safely, when TypeScript type will be completed.
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
    eventName:
      | "connected"
      | "reconnected"
      | "tokenExpired"
      | "reAuthenticated"
      | "websocketRenewalStart"
      | "websocketRenewalDone",
    listener: () => void
  ): this;
  on(
    eventName: "logoutAttempt",
    listener: (status: { success: true }) => void
  ): this;
  on(
    eventName: "loginAttempt",
    listener: (data: { success: boolean; error: string }) => void
  ): this;
  on(eventName: "discarded", listener: (request: RequestPayload) => void): this;
  on(
    eventName: "disconnect" | "disconnected",
    listener: (context: { origin: DisconnectionOrigin }) => void
  ): this;
  on(
    eventName: "networkError" | "reconnectionError",
    listener: (error: Error) => void
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

  removeListener(eventName: KuzzleSDKEvents, listener: () => void): this;
  removeListener(eventName: string, listener: () => void): this;
  removeListener(eventName: string, listener: (...args: unknown[]) => void) {
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

  removeAllListeners(eventName?: KuzzleSDKEvents): this;
  removeAllListeners(eventName?: string): this;
  removeAllListeners(eventName?: string): this {
    if (eventName) {
      this._events.delete(eventName);
    } else {
      this._events = new Map();
    }

    return this;
  }

  // TODO: Improve these unknown type someday, to secure all emit events and be sure they match {@link KuzzleEventEmitter.on}.
  emit(eventName: KuzzleSDKEvents, ...payload: unknown[]): boolean;
  emit(eventName: string, ...payload: unknown[]): boolean;
  emit(eventName: string, ...payload: unknown[]): boolean {
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
