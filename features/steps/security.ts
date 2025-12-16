/* eslint-disable no-invalid-this */
import type { IWorld } from "@cucumber/cucumber";
import { Given, When } from "@cucumber/cucumber";

import type { Kuzzle } from "../../index";

type SecurityWorld = IWorld & {
  kuzzle: Kuzzle;
  user: string;
  content: unknown;
};

Given<SecurityWorld>(
  "there is an user with id {string}",
  async function (this: SecurityWorld, id: string) {
    this.user = id;

    try {
      await this.kuzzle.security.createOrReplaceProfile("test", {
        policies: [{ roleId: "admin" }],
      });

      const content = await this.kuzzle.security.createUser(id, {
        content: {
          profileIds: ["test"],
        },
        credentials: {},
      });

      this.content = content;
    } catch {
      /* do nothing */
    }
  },
);

Given<SecurityWorld>(
  "the user has {string} credentials with name {string} and password {string}",
  async function (
    this: SecurityWorld,
    strategy: string,
    username: string,
    password: string,
  ) {
    try {
      await this.kuzzle.security.createCredentials(strategy, this.user, {
        username,
        password,
      });
    } catch {
      await this.kuzzle.security.updateCredentials(strategy, this.user, {
        username,
        password,
      });
    }
  },
);

When<SecurityWorld>("I get my user info", async function (this: SecurityWorld) {
  this.content = await this.kuzzle.security.getUser(this.user);
});

When<SecurityWorld>(
  "I update my user custom data with the pair {string}:{string}",
  async function (this: SecurityWorld, key: string, val: string) {
    this.content = await this.kuzzle.security.updateUser(this.user, {
      [key]: val,
    });
  },
);
