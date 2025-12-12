import type { IWorldOptions } from "@cucumber/cucumber";
import {
  setWorldConstructor,
  World as CucumberWorld,
} from "@cucumber/cucumber";

import { Kuzzle, WebSocket } from "../../index";

class World extends CucumberWorld {
  kuzzle: Kuzzle;
  index: string | null;
  collection: string | null;
  ids: string[];
  user: string | null;
  jwt: string | null;
  rights: unknown[] | null;
  previousJwt: string | null;
  content: unknown;
  error: unknown;
  notifications: unknown[];
  total: number | null;
  callback: (notification: unknown) => void;

  constructor(options: IWorldOptions) {
    super(options);

    this.kuzzle = new Kuzzle(new WebSocket("localhost", { port: 7512 }));

    this.index = null;
    this.collection = null;
    this.ids = [];
    this.user = null;
    this.jwt = null;
    this.rights = null;
    this.previousJwt = null;

    this.content = null;
    this.error = null;
    this.notifications = [];
    this.total = null;

    this.callback = (notification: unknown) => {
      this.notifications.push(notification);
    };
  }
}

setWorldConstructor(World);
