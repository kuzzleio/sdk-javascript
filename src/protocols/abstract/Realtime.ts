"use strict";

import { KuzzleAbstractProtocol } from "./Base";
import * as DisconnectionOrigin from "../DisconnectionOrigin";

export abstract class BaseProtocolRealtime extends KuzzleAbstractProtocol {
  protected _reconnectionDelay: number;
  protected wasConnected: boolean;
  protected stopRetryingToConnect: boolean;
  protected retrying: boolean;

  public autoReconnect: boolean;

  constructor(host, options: any = {}, name: string) {
    super(host, options, name);

    this.autoReconnect =
      typeof options.autoReconnect === "boolean" ? options.autoReconnect : true;
    this._reconnectionDelay =
      typeof options.reconnectionDelay === "number"
        ? options.reconnectionDelay
        : 1000;

    this.wasConnected = false;
    this.stopRetryingToConnect = false;
    this.retrying = false;
  }

  /**
   * Number of milliseconds between reconnection attempts
   */
  get reconnectionDelay(): number {
    return this._reconnectionDelay;
  }

  connect(): Promise<any> {
    this.state = "connecting";

    return Promise.resolve();
  }

  /**
   * Called when the client's connection is established
   */
  clientConnected() {
    super.clientConnected("connected", this.wasConnected);

    this.state = "connected";
    this.wasConnected = true;
    this.stopRetryingToConnect = false;
  }

  /**
   * Called when the client's connection is closed
   *
   * @param {string} origin String that describe what is causing the disconnection
   */
  clientDisconnected(origin: string) {
    this.clear();
    this.emit("disconnect", { origin });
  }

  /**
   * Called when the client's connection is closed with an error state
   *
   * @param {Error} error
   */
  clientNetworkError(error) {
    // Only emit disconnect once, if the connection was ready before
    if (this.isReady()) {
      this.emit("disconnect", { origin: DisconnectionOrigin.NETWORK_ERROR });
    }
    this.state = "offline";
    this.clear();

    const connectionError = new Error(
      `Unable to connect to kuzzle server at ${this.host}:${this.port}: ${error.message} (ws status=${error.status})`
    );

    this.emit("networkError", connectionError);

    if (this.autoReconnect && !this.retrying && !this.stopRetryingToConnect) {
      this.retrying = true;

      if (
        typeof window === "object" &&
        typeof window.navigator === "object" &&
        window.navigator.onLine === false
      ) {
        window.addEventListener(
          "online",
          () => {
            this.retrying = false;
            this.connect().catch((err) => this.clientNetworkError(err));
          },
          { once: true }
        );
        return;
      }

      setTimeout(() => {
        this.retrying = false;
        this.connect().catch((err) => this.clientNetworkError(err));
      }, this.reconnectionDelay);
    }
  }

  isReady() {
    return this.state === "connected";
  }
}
