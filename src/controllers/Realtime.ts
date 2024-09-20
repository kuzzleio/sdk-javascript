import { BaseController } from "./Base";
import Room from "../core/Room";
import { Notification, JSONObject, ArgsDefault } from "../types";

/**
 * Enum for `scope` option of realtime.subscribe method
 */
export enum ScopeOption {
  /**
   * Receive all document notifications
   */
  all = "all",
  /**
   * Receive notifications when document enter or stay in the scope
   */
  in = "in",
  /**
   * Receive notification when document exit the scope
   */
  out = "out",
  /**
   * Do not receive document notifications
   */
  none = "none",
}

/**
 * Enum for `user` option of realtime.subscribe method
 */
export enum UserOption {
  /**
   * Receive all user notifications
   */
  all = "all",
  /**
   * Receive notification when users join the room
   */
  in = "in",
  /**
   * Receive notifications when users leave the room
   */
  out = "out",
  /**
   * Do not receive user notifications
   */
  none = "none",
}

export class RealtimeController extends BaseController {
  private _subscriptions: Map<string, Array<Room>>;
  private _subscriptionsOff: Map<string, Array<Room>>;

  constructor(kuzzle) {
    super(kuzzle, "realtime");

    this._subscriptions = new Map();
    this._subscriptionsOff = new Map();

    this.kuzzle.on("tokenExpired", () => this.removeSubscriptions());
    this.kuzzle.on("disconnected", () => this.saveSubscriptions());
    this.kuzzle.on("networkError", () => this.saveSubscriptions());
    this.kuzzle.on("reconnected", () => this.resubscribe());
    this.kuzzle.on("reAuthenticated", () => {
      this.saveSubscriptions();
      this.resubscribe();
    });
  }

  /**
   * Returns the number of other connections sharing the same subscription.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/realtime/count/
   *
   * @param roomId Subscription room ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns A number representing active connections using the same provided subscription room.
   */
  count(
    roomId: string,
    options: ArgsRealtimeControllerCount = {}
  ): Promise<number> {
    const request: any = {
      action: "count",
      body: { roomId },
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result.count);
  }

  /**
   * Sends a real-time message to Kuzzle.
   *
   * The message will be dispatched to all clients with subscriptions
   * matching the index, the collection and the message content.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/realtime/publish/
   *
   * @param index Index name
   * @param collection Collection name
   * @param message Message to send (will be put in `_source` property of the notification)
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `_id` Additional unique ID (will be put in the `_id` property of the notification)
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   */
  publish(
    index: string,
    collection: string,
    message: JSONObject,
    options: ArgsRealtimeControllerPublish = {}
  ): Promise<boolean> {
    const request: any = {
      action: "publish",
      body: message,
      collection,
      index,
    };

    if (options._id !== undefined) {
      request._id = options._id;
    }

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) => response.result.published
    );
  }

  /**
   * Subscribes by providing a set of filters: messages, document changes
   * and, optionally, user events matching the provided filters will generate
   * real-time notifications.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/realtime/subscribe/
   * @see https://docs.kuzzle.io/sdk/js/7/essentials/realtime-notifications/
   *
   * @param index Index name
   * @param collection Collection name
   * @param filters Optional subscription filters (@see https://docs.kuzzle.io/core/2/api/koncorde-filters-syntax)
   * @param callback Callback function to handle notifications
   * @param options Additional options
   *    - `scope` Subscribe to document entering or leaving the scope. (default: 'all')
   *    - `users` Subscribe to users entering or leaving the room. (default: 'none')
   *    - `subscribeToSelf` Subscribe to notifications fired by our own queries. (default: true)
   *    - `volatile` Subscription information sent alongside notifications
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns A string containing the room ID
   */
  subscribe(
    index: string,
    collection: string,
    filters: JSONObject,
    callback: (notification: Notification) => void | Promise<void>,
    options: ArgsRealtimeControllerSubscribe = {}
  ): Promise<string> {
    const room = new Room(this, index, collection, filters, callback, options);

    return room.subscribe().then(() => {
      if (!this._subscriptions.has(room.id)) {
        this._subscriptions.set(room.id, []);
      }
      this._subscriptions.get(room.id).push(room);
      return room.id;
    });
  }

  /**
   * Removes a subscription
   *
   * @param roomId Subscription room ID
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   */
  unsubscribe(
    roomId: string,
    options: ArgsRealtimeControllerUnsubscribe = {}
  ): Promise<void> {
    const request: any = {
      action: "unsubscribe",
      body: { roomId },
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(() => {
      const rooms = this._subscriptions.get(roomId);

      if (rooms) {
        for (const room of rooms) {
          room.removeListeners();
        }

        this._subscriptions.delete(roomId);
      }
    });
  }

  /**
   * Called when kuzzle is disconnected
   */
  private saveSubscriptions() {
    /**
     * Use forEach instead of iterating over Map.keys() because the Webpack
     * transpilation is producing bad code leading to a loop not iterating.
     */
    this._subscriptions.forEach((rooms, roomId) => {
      for (const room of rooms) {
        room.removeListeners();

        if (room.autoResubscribe) {
          if (!this._subscriptionsOff.has(roomId)) {
            this._subscriptionsOff.set(roomId, []);
          }
          this._subscriptionsOff.get(roomId).push(room);
        }
      }

      this._subscriptions.delete(roomId);
    });
  }

  /**
   * Called on kuzzle reconnection
   */
  private resubscribe() {
    /**
     * Use forEach instead of iterating over Map.keys() because the Webpack
     * transpilation is producing bad code leading to a loop not iterating.
     */
    this._subscriptionsOff.forEach((rooms, roomId) => {
      for (const room of rooms) {
        if (!this._subscriptions.has(roomId)) {
          this._subscriptions.set(roomId, []);
        }
        this._subscriptions.get(roomId).push(room);

        room
          .subscribe()
          .catch(() =>
            this.kuzzle.emit("discarded", { request: room.request })
          );
      }

      this._subscriptionsOff.delete(roomId);
    });
  }

  /**
   * Called when a token expire
   */
  private removeSubscriptions() {
    /**
     * Use forEach instead of iterating over Map.keys() because the Webpack
     * transpilation is producing bad code leading to a loop not iterating.
     */
    this._subscriptions.forEach((rooms) => {
      for (const room of rooms) {
        room.removeListeners();
      }
    });

    this._subscriptions = new Map();
    this._subscriptionsOff = new Map();
  }
}

export type ArgsRealtimeControllerCount = ArgsDefault;

export interface ArgsRealtimeControllerPublish extends ArgsDefault {
  _id?: string;
}

export interface ArgsRealtimeControllerSubscribe extends ArgsDefault {
  scope?: ScopeOption;
  users?: UserOption;
  subscribeToSelf?: boolean;
  volatile?: JSONObject;
}

export type ArgsRealtimeControllerUnsubscribe = ArgsDefault;
