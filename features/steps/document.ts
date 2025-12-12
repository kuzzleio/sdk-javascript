/* eslint-disable no-invalid-this */
import type { IWorld } from "@cucumber/cucumber";
import { Given, Then, When } from "@cucumber/cucumber";
import should from "should";

import type { Kuzzle } from "../../index";

type DocumentWorld = IWorld & {
  kuzzle: Kuzzle;
  index: string;
  collection: string;
  ids: string[];
  content: any;
  error: any;
};

Given<DocumentWorld>(
  /^the collection doesn't have a document with id '(.*?)'$/,
  async function (this: DocumentWorld, id: string) {
    try {
      this.content = await this.kuzzle.document.delete(
        this.index,
        this.collection,
        id,
      );
    } catch (err) {
      this.error = err;
    }
  },
);

Given<DocumentWorld>(
  "the collection has a document with id {string}",
  async function (this: DocumentWorld, id: string) {
    this.content = await this.kuzzle.document.create(
      this.index,
      this.collection,
      { a: "document" },
      id,
      {
        refresh: "wait_for",
      },
    );
  },
);

Then<DocumentWorld>(
  "I get an error in the errors array",
  function (this: DocumentWorld) {
    should(this.content.errors).be.Array().not.be.empty();
  },
);

Then<DocumentWorld>(
  "I should have no errors in the errors array",
  function (this: DocumentWorld) {
    should(this.content.errors).be.empty();
  },
);

When<DocumentWorld>(
  "I check if {string} exists",
  async function (this: DocumentWorld, id: string) {
    this.content = await this.kuzzle.document.exists(
      this.index,
      this.collection,
      id,
    );
  },
);

When<DocumentWorld>(
  "I count how many documents there is in the collection",
  async function (this: DocumentWorld) {
    this.content = await this.kuzzle.document.count(
      this.index,
      this.collection,
      {},
    );
  },
);

When<DocumentWorld>(
  "I create a document in {string}",
  async function (this: DocumentWorld, collection: string) {
    this.content = await this.kuzzle.document.create(
      this.index,
      collection,
      { a: "document" },
      "some-id",
      {
        refresh: "wait_for",
      },
    );
  },
);

When<DocumentWorld>(
  "I create a document with id {string}",
  async function (this: DocumentWorld, id: string) {
    this.ids = [id];

    try {
      this.content = await this.kuzzle.document.create(
        this.index,
        this.collection,
        { a: "document" },
        id,
        {
          refresh: "wait_for",
        },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I create the documents [{string}, {string}]",
  async function (this: DocumentWorld, id1: string, id2: string) {
    this.ids = [id1, id2];

    try {
      this.content = await this.kuzzle.document.mCreate(
        this.index,
        this.collection,
        [
          { _id: id1, body: { a: "document" } },
          { _id: id2, body: { a: "document" } },
        ],
        {
          refresh: "wait_for",
        },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I createOrReplace a document with id {string}",
  async function (this: DocumentWorld, id: string) {
    this.ids = [id];

    try {
      this.content = await this.kuzzle.document.createOrReplace(
        this.index,
        this.collection,
        id,
        { a: "replaced document" },
        { refresh: "wait_for" },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I createOrReplace the documents [{string}, {string}]",
  async function (this: DocumentWorld, id1: string, id2: string) {
    this.ids = [id1, id2];

    try {
      this.content = await this.kuzzle.document.mCreateOrReplace(
        this.index,
        this.collection,
        [
          { _id: id1, body: { a: "replaced document" } },
          { _id: id2, body: { a: "replaced document" } },
        ],
        {
          refresh: "wait_for",
        },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I delete the document with id {string}",
  async function (this: DocumentWorld, id: string) {
    this.ids = [id];

    try {
      this.content = await this.kuzzle.document.delete(
        this.index,
        this.collection,
        id,
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I delete the documents [{string}, {string}]",
  async function (this: DocumentWorld, id1: string, id2: string) {
    this.ids = [id1, id2];

    try {
      this.content = await this.kuzzle.document.mDelete(
        this.index,
        this.collection,
        [id1, id2],
        { refresh: "wait_for" },
      );
    } catch (error) {
      this.error = error;
    }
  },
);

When<DocumentWorld>(
  "I replace a document with id {string}",
  async function (this: DocumentWorld, id: string) {
    this.ids = [id];

    try {
      this.content = await this.kuzzle.document.replace(
        this.index,
        this.collection,
        id,
        { a: "replaced document" },
        { refresh: "wait_for" },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I replace the documents [{string}, {string}]",
  async function (this: DocumentWorld, id1: string, id2: string) {
    this.ids = [id1, id2];

    try {
      this.content = await this.kuzzle.document.mReplace(
        this.index,
        this.collection,
        [
          { _id: id1, body: { a: "replaced document" } },
          { _id: id2, body: { a: "replaced document" } },
        ],
        { refresh: "wait_for" },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I get documents [{string}, {string}]",
  async function (this: DocumentWorld, id1: string, id2: string) {
    this.ids = [id1, id2];
    this.content = await this.kuzzle.document.mGet(
      this.index,
      this.collection,
      [id1, id2],
    );
  },
);

When<DocumentWorld>(
  "I search a document with id {string}",
  async function (this: DocumentWorld, id: string) {
    try {
      this.content = await this.kuzzle.document.search(
        this.index,
        this.collection,
        {
          query: {
            match: {
              _id: id,
            },
          },
        },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I search documents matching {string} with from {int} and size {int}",
  async function (
    this: DocumentWorld,
    query: string,
    from: number,
    size: number,
  ) {
    this.content = await this.kuzzle.document.search(
      this.index,
      this.collection,
      JSON.parse(query),
      { from, size },
    );
  },
);

When<DocumentWorld>(
  "I search the next documents",
  async function (this: DocumentWorld) {
    const nextPage = await this.content.next();
    this.content = nextPage;
  },
);

When<DocumentWorld>(
  "I update a document with id {string}",
  async function (this: DocumentWorld, id: string) {
    this.ids = [id];

    try {
      this.content = await this.kuzzle.document.update(
        this.index,
        this.collection,
        id,
        { some: "update" },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

When<DocumentWorld>(
  "I update the document with id {string} and content {string} = {string}",
  async function (this: DocumentWorld, id: string, key: string, val: string) {
    this.content = await this.kuzzle.document.update(
      this.index,
      this.collection,
      id,
      { [key]: val },
    );
  },
);

When<DocumentWorld>(
  "I update the documents [{string}, {string}]",
  async function (this: DocumentWorld, id1: string, id2: string) {
    this.ids = [id1, id2];

    try {
      this.content = await this.kuzzle.document.mUpdate(
        this.index,
        this.collection,
        [
          { _id: id1, body: { a: "replaced document", some: "update" } },
          { _id: id2, body: { a: "replaced document", some: "update" } },
        ],
        { refresh: "wait_for" },
      );
    } catch (err) {
      this.error = err;
    }
  },
);

Then<DocumentWorld>(
  "I get an error with message {string}",
  function (this: DocumentWorld, message: string) {
    should(this.error).not.be.null();
    should(this.error.message).eql(message);
  },
);

Then<DocumentWorld>(
  "I must have {int} documents in the collection",
  async function (this: DocumentWorld, number: number) {
    const count = await this.kuzzle.document.count(
      this.index,
      this.collection,
      {},
    );
    should(count).eql(number);
  },
);

Then<DocumentWorld>(
  "the document is successfully created",
  async function (this: DocumentWorld) {
    const document = await this.kuzzle.document.get(
      this.index,
      this.collection,
      this.ids[0],
    );
    should(document).be.an.Object();
  },
);

Then<DocumentWorld>(
  "the document is successfully deleted",
  async function (this: DocumentWorld) {
    try {
      await this.kuzzle.document.get(this.index, this.collection, this.ids[0]);
      throw new Error("Expected promise to be rejected");
    } catch (error) {
      should((error as any).status).eql(404);
    }
  },
);

Then<DocumentWorld>(
  /^the document is (successfully|not) found$/,
  function (this: DocumentWorld, yesno: string) {
    should(this.error).be.null();
    should(this.content.constructor.name).eql("DocumentSearchResult");
    should(this.content.total).eql(yesno === "successfully" ? 1 : 0);
  },
);

Then<DocumentWorld>(
  "the document is successfully replaced",
  async function (this: DocumentWorld) {
    const document = await this.kuzzle.document.get(
      this.index,
      this.collection,
      this.ids[0],
    );
    should(document._source.a).eql("replaced document");
  },
);

Then<DocumentWorld>(
  "the document is successfully updated",
  async function (this: DocumentWorld) {
    const document = await this.kuzzle.document.get(
      this.index,
      this.collection,
      this.ids[0],
    );
    should(document._source.some).eql("update");
  },
);

Then<DocumentWorld>(
  "the document {string} should be created",
  async function (this: DocumentWorld, id: string) {
    const document = await this.kuzzle.document.get(
      this.index,
      this.collection,
      id,
    );
    should(document).not.be.null();
  },
);

Then<DocumentWorld>(
  "the document {string} should be replaced",
  async function (this: DocumentWorld, id: string) {
    const document = await this.kuzzle.document.get(
      this.index,
      this.collection,
      id,
    );
    should(document._source.a).eql("replaced document");
  },
);

Then<DocumentWorld>(
  "the document {string} should be updated",
  async function (this: DocumentWorld, id: string) {
    const document = await this.kuzzle.document.get(
      this.index,
      this.collection,
      id,
    );
    should(document._source.some).eql("update");
  },
);

Then<DocumentWorld>(
  /^the document should (not )?exist$/,
  function (this: DocumentWorld, not?: string) {
    should(this.error).be.null();

    if (not) {
      should(this.content).be.false();
    } else {
      should(this.content).be.true();
    }
  },
);

Then<DocumentWorld>(
  "the documents should be retrieved",
  function (this: DocumentWorld) {
    should(this.content.successes.length).eql(this.ids.length);
    should(this.content.errors).be.empty();

    const found = this.content.successes.map((r: { _id: string }) => r._id);

    for (const id of this.ids) {
      should(found.indexOf(id)).be.greaterThan(-1);
    }
  },
);

Then<DocumentWorld>(
  /^The search result should have (fetched|a total of) (\d+) documents$/,
  function (this: DocumentWorld, what: string, number: number) {
    should(this.content.constructor.name).eql("DocumentSearchResult");

    let field: "total" | "fetched" = "total";
    switch (what) {
      case "a total of":
        field = "total";
        break;
      case "fetched":
        field = "fetched";
        break;
    }

    should(this.content[field]).eql(number);
  },
);
