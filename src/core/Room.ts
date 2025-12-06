import type {
  ArgsRealtimeControllerSubscribe,
  RealtimeController,
} from "../controllers/Realtime";
import type { JSONObject, Notification } from "../types";

type SubscribeResponse = {
  result: {
    channel: string;
    roomId: string;
  };
};

type RoomOptions = ArgsRealtimeControllerSubscribe & {
  autoResubscribe?: boolean;
  state?: string;
};

type SubscribeRequest = {
  action: "subscribe";
  body: JSONObject;
  collection: string;
  controller: "realtime";
  index: string;
  scope?: RoomOptions["scope"];
  state?: RoomOptions["state"];
  users?: RoomOptions["users"];
  volatile?: RoomOptions["volatile"];
};

type RoomCallback = (notification: Notification) => void | Promise<void>;

class Room {
  public controller: RealtimeController;
  public index: string;
  public collection: string;
  public callback: RoomCallback;
  public options: RoomOptions;
  public id: string = null;
  public channel: string = null;
  public request: SubscribeRequest;
  public autoResubscribe: boolean;
  public subscribeToSelf: boolean;
  private _kuzzle: any;

  /**
   * @param controller
   * @param index
   * @param collection
   * @param body
   * @param callback
   * @param options
   */
  constructor(
    controller: RealtimeController,
    index: string,
    collection: string,
    body: JSONObject,
    callback: RoomCallback,
    options: RoomOptions = {},
  ) {
    Reflect.defineProperty(this, "_kuzzle", {
      value: controller.kuzzle,
    });
    this.controller = controller;
    this.index = index;
    this.collection = collection;
    this.callback = callback;
    this.options = options;

    this.id = null;
    this.channel = null;

    this.request = {
      action: "subscribe",
      body,
      collection,
      controller: "realtime",
      index,
      scope: this.options.scope,
      state: this.options.state,
      users: this.options.users,
      volatile: this.options.volatile,
    };

    this.autoResubscribe =
      typeof options.autoResubscribe === "boolean"
        ? options.autoResubscribe
        : this.kuzzle.autoResubscribe;
    this.subscribeToSelf =
      typeof options.subscribeToSelf === "boolean"
        ? options.subscribeToSelf
        : true;

    this._channelListener = this._channelListener.bind(this);
  }

  get kuzzle() {
    return this._kuzzle;
  }

  subscribe(): Promise<SubscribeResponse> {
    return this.kuzzle
      .query(this.request, this.options)
      .then((response: SubscribeResponse) => {
        this.id = response.result.roomId;
        this.channel = response.result.channel;

        this.kuzzle.protocol.on(this.channel, this._channelListener);

        return response;
      });
  }

  removeListeners(): void {
    if (this.channel) {
      this.kuzzle.protocol.removeListener(this.channel, this._channelListener);
    }
  }

  private _channelListener(data: any): void {
    if (data.type === "TokenExpired") {
      return this.kuzzle.tokenExpired();
    }

    const fromSelf =
      data.volatile && data.volatile.sdkInstanceId === this.kuzzle.protocol.id;

    if (this.subscribeToSelf || !fromSelf) {
      try {
        const callbackResponse = this.callback(data);

        if (
          callbackResponse !== null &&
          typeof callbackResponse === "object" &&
          typeof callbackResponse.then === "function" &&
          typeof callbackResponse.catch === "function"
        ) {
          callbackResponse.catch((error) => {
            this.kuzzle.emit("callbackError", { error, notification: data });
          });
        }
      } catch (error) {
        this.kuzzle.emit("callbackError", { error, notification: data });
      }
    }
  }
}

export default Room;
