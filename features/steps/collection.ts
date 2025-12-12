/* eslint-disable no-invalid-this */
import type { IWorld } from "@cucumber/cucumber";
import { Given, Then, When } from "@cucumber/cucumber";
import should from "should";

import type { Kuzzle } from "../../index";

type CollectionWorld = IWorld & {
  kuzzle: Kuzzle;
  index: string;
  collection: string;
  content: unknown;
  error: unknown;
  total: number | null;
};

Given<CollectionWorld>(
  "has specifications",
  async function (this: CollectionWorld) {
    await this.kuzzle.collection.updateSpecifications(
      this.index,
      this.collection,
      { strict: true },
    );
  },
);

Given<CollectionWorld>(
  "it has a collection {string}",
  async function (this: CollectionWorld, collection: string) {
    await this.kuzzle.collection.create(this.index, collection, {});
    this.collection = collection;
  },
);

Given<CollectionWorld>(
  "I truncate the collection {string}",
  async function (this: CollectionWorld, collection: string) {
    await this.kuzzle.collection.truncate(this.index, collection, {
      refresh: "wait_for",
    });
  },
);

When<CollectionWorld>(
  "I check if the collection {string} exists",
  async function (this: CollectionWorld, collection: string) {
    try {
      this.content = await this.kuzzle.collection.exists(
        this.index,
        collection,
      );
    } catch (error) {
      this.error = error;
    }
  },
);

When<CollectionWorld>(
  /^I create a collection '(.*?)'( with a mapping)?$/,
  async function (
    this: CollectionWorld,
    collection: string,
    withMapping?: string,
  ) {
    const mapping = withMapping
      ? { properties: { gordon: { type: "keyword" } } }
      : undefined;

    try {
      this.content = await this.kuzzle.collection.create(
        this.index,
        collection,
        mapping,
      );
    } catch (error) {
      this.error = error;
    }
  },
);

When<CollectionWorld>(
  "I delete the specifications of {string}",
  async function (this: CollectionWorld, collection: string) {
    try {
      await this.kuzzle.collection.deleteSpecifications(this.index, collection);
    } catch (error) {
      this.error = error;
    }
  },
);

When<CollectionWorld>(
  "I list the collections of {string}",
  async function (this: CollectionWorld, index: string) {
    try {
      const content = await this.kuzzle.collection.list(index);
      this.content = content;
      this.total = content.collections.length;
    } catch (error) {
      this.error = error;
    }
  },
);

When<CollectionWorld>(
  "I update the mapping of collection {string}",
  async function (this: CollectionWorld, collection: string) {
    try {
      this.content = await this.kuzzle.collection.updateMapping(
        this.index,
        collection,
        {
          properties: {
            gordon: { type: "keyword" },
          },
        },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<CollectionWorld>(
  "I update the specifications of the collection {string}",
  async function (this: CollectionWorld, collection: string) {
    try {
      this.content = await this.kuzzle.collection.updateSpecifications(
        this.index,
        collection,
        { strict: false },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<CollectionWorld>(
  "I validate the specifications of {string}",
  async function (this: CollectionWorld, collection: string) {
    this.content = await this.kuzzle.collection.validateSpecifications(
      this.index,
      collection,
      { strict: true },
    );
  },
);

Then<CollectionWorld>(
  "the collection {string} should be empty",
  async function (this: CollectionWorld, collection: string) {
    const result = await this.kuzzle.document.search(
      this.index,
      collection,
      {},
    );
    should(result.total).eql(0);
  },
);

Then<CollectionWorld>(
  /^the collection(?: '(.*?)')? should exist$/,
  async function (this: CollectionWorld, collection?: string) {
    const c = collection || this.collection;
    const exists = await this.kuzzle.collection.exists(this.index, c);

    should(exists).be.true();
  },
);

Then<CollectionWorld>(
  "the mapping of {string} should be updated",
  async function (this: CollectionWorld, collection: string) {
    const mappings = await this.kuzzle.collection.getMapping(
      this.index,
      collection,
    );

    should(mappings).eql({
      dynamic: "true",
      properties: {
        gordon: { type: "keyword" },
      },
    });
  },
);

Then<CollectionWorld>(
  "the specifications of {string} should be updated",
  async function (this: CollectionWorld, collection: string) {
    const specifications = await this.kuzzle.collection.getSpecifications(
      this.index,
      collection,
    );

    should(specifications.validation).eql({ strict: false });
  },
);

Then<CollectionWorld>(
  "the specifications of {string} must not exist",
  async function (this: CollectionWorld, collection: string) {
    try {
      await this.kuzzle.collection.getSpecifications(this.index, collection);
      throw new Error("Expected promise to be rejected");
    } catch (error) {
      should((error as { status?: number }).status).eql(404);
    }
  },
);

Then<CollectionWorld>(
  "they should be validated",
  function (this: CollectionWorld) {
    should(this.content).eql({
      valid: true,
    });
  },
);
