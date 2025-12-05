/* eslint-disable no-invalid-this */

import type { IWorld } from "@cucumber/cucumber";
import { Before, BeforeAll } from "@cucumber/cucumber";

type HookWorld = IWorld & {
  kuzzle: {
    connect: () => Promise<unknown>;
    query: (payload: Record<string, unknown>) => Promise<unknown>;
  };
  index: string | null;
  collection: string | null;
  ids: string[];
  user: string | null;
  jwt: string | null;
  content: unknown;
  error: unknown;
  notifications: unknown[];
};

Before<HookWorld>(async function () {
  console.log(this);
  await clean(this);
});

BeforeAll(function () {
  const world = this as unknown as HookWorld;

  world.index = null;
  world.collection = null;
  world.ids = [];
  world.user = null;
  world.jwt = null;

  world.content = null;
  world.error = null;
  world.notifications = [];
});

async function clean(world: HookWorld) {
  try {
    await world.kuzzle.connect();
    await world.kuzzle.query({
      controller: "admin",
      action: "resetDatabase",
    });
  } catch (error) {
    // rethrow to get a readable error
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  }
}
