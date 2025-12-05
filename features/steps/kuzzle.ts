/* eslint-disable no-invalid-this */
import type { IWorld } from "@cucumber/cucumber";
import { Given, Then } from "@cucumber/cucumber";
import should from "should";

import type { Kuzzle } from "../../index";

type KuzzleWorld = IWorld & {
  kuzzle: Kuzzle;
  error: any;
  content: any;
  total: number | null;
};

Given<KuzzleWorld>("Kuzzle Server is running", function (this: KuzzleWorld) {
  return this.kuzzle.connect();
});

Then<KuzzleWorld>(
  /^I get an error(?: with status (.*))?$/,
  function (this: KuzzleWorld, status?: string) {
    should(this.error).not.be.null();

    if (status) {
      should(this.error.status).eql(parseInt(status, 10));
    }
  },
);

Then<KuzzleWorld>(
  "I get {string} and {string}",
  function (this: KuzzleWorld, string1: string, string2: string) {
    should(this.content).be.an.Array();
    should(this.content.length).eql(2);

    for (const val of [string1, string2]) {
      should(this.content.indexOf(val)).be.greaterThanOrEqual(0);
    }
  },
);

Then<KuzzleWorld>(
  "the content should not be null",
  function (this: KuzzleWorld) {
    should(this.content).not.be.null();
  },
);

Then<KuzzleWorld>(
  /^the response '(.*)' field contains the pair '(.*)':'(.*)'$/,
  function (this: KuzzleWorld, field: string, key: string, val: string) {
    should(this.content[field][key]).eql(val);
  },
);

Then<KuzzleWorld>(
  /^I shall receive (.*?)$/,
  function (this: KuzzleWorld, value: string) {
    let expected: any = value;

    if (/^\d+$/.test(value)) {
      expected = parseInt(value, 10);
    } else if (/^[\d.]+$/.test(value)) {
      expected = parseFloat(value);
    } else if (/(true|false)/.test(value)) {
      expected = value === "true";
    }

    should(this.content).eql(expected);
  },
);

Then<KuzzleWorld>(
  "the result contains {int} hits",
  function (this: KuzzleWorld, hits: number) {
    should(this.total).eql(hits);
  },
);
