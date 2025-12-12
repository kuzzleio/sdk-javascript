/* eslint-disable no-invalid-this */
import type { IWorld } from "@cucumber/cucumber";
import { Given, Then, When } from "@cucumber/cucumber";
import should from "should";

import type { Kuzzle } from "../../index";

type RealtimeWorld = IWorld & {
  kuzzle: Kuzzle;
  index: string;
  collection: string;
  callback: (notification: unknown) => void;
  content: string;
  notifications: unknown[];
};

Given<RealtimeWorld>(
  /^I subscribe to '(.*?)'(?: with '(.*)' as filter)?$/,
  async function (this: RealtimeWorld, collection: string, filter?: string) {
    const parsedFilter = filter ? JSON.parse(filter) : {};

    this.content = await this.kuzzle.realtime.subscribe(
      this.index,
      collection,
      parsedFilter,
      this.callback,
    );
  },
);

Given<RealtimeWorld>("I unsubscribe", async function (this: RealtimeWorld) {
  await this.kuzzle.realtime.unsubscribe(this.content);
});

When<RealtimeWorld>(
  "I publish a document",
  async function (this: RealtimeWorld) {
    await this.kuzzle.realtime.publish(this.index, this.collection, {
      a: "document",
    });
  },
);

Then<RealtimeWorld>(
  "I receive a notification",
  function (this: RealtimeWorld, cb: (error?: unknown) => void) {
    setTimeout(() => {
      try {
        should(this.notifications.length).eql(1);
        cb();
      } catch (e) {
        cb(e);
      }
    }, 1000);
  },
);

Then<RealtimeWorld>(
  "I do not receive a notification",
  function (this: RealtimeWorld, cb: (error?: unknown) => void) {
    setTimeout(() => {
      try {
        should(this.notifications.length).eql(0);
        cb();
      } catch (e) {
        cb(e);
      }
    }, 1000);
  },
);
