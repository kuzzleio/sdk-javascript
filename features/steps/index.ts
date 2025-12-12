/* eslint-disable no-invalid-this */
import type { IWorld } from "@cucumber/cucumber";
import { Given, Then, When } from "@cucumber/cucumber";
import should from "should";

import type { Kuzzle } from "../../index";

type IndexWorld = IWorld & {
  kuzzle: Kuzzle;
  index: string;
  content: unknown;
  error: unknown;
};

Given<IndexWorld>(
  "there is an index {string}",
  async function (this: IndexWorld, index: string) {
    const exists = await this.kuzzle.index.exists(index);

    if (!exists) {
      await this.kuzzle.index.create(index);
    }

    this.index = index;
  },
);

Given<IndexWorld>(
  "there is no index called {string}",
  async function (this: IndexWorld, index: string) {
    try {
      this.content = await this.kuzzle.index.delete(index);
    } catch {
      /* do nothing */
    }
  },
);

Given<IndexWorld>(
  "there is the indexes {string} and {string}",
  async function (this: IndexWorld, index1: string, index2: string) {
    const ensureIndex = async (index: string) => {
      const exists = await this.kuzzle.index.exists(index);

      if (!exists) {
        await this.kuzzle.index.create(index);
        await this.kuzzle.collection.create(index, "a-collection", {});
      }
    };

    await ensureIndex(index1);
    await ensureIndex(index2);
  },
);

When<IndexWorld>(
  "I create an index called {string}",
  async function (this: IndexWorld, index: string) {
    try {
      this.content = await this.kuzzle.index.create(index);
      this.index = index;
    } catch (error) {
      this.error = error;
    }
  },
);

When<IndexWorld>(
  "I delete the indexes {string} and {string}",
  async function (this: IndexWorld, index1: string, index2: string) {
    this.content = await this.kuzzle.index.mDelete([index1, index2]);
  },
);

When<IndexWorld>("I list indexes", async function (this: IndexWorld) {
  try {
    this.content = await this.kuzzle.index.list();
  } catch (error) {
    this.error = error;
  }
});

Then<IndexWorld>("the index should exist", async function (this: IndexWorld) {
  const exists = await this.kuzzle.index.exists(this.index);

  should(exists).be.true();
});

Then<IndexWorld>(
  "indexes {string} and {string} don't exist",
  async function (this: IndexWorld, index1: string, index2: string) {
    const check = async (index: string) => {
      const exists = await this.kuzzle.index.exists(index);
      should(exists).be.false();
    };

    await check(index1);
    await check(index2);
  },
);
