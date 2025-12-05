/* eslint-disable no-invalid-this */
import type { IWorld } from "@cucumber/cucumber";
import { Given, Then, When } from "@cucumber/cucumber";
import retry from "retry";
import should from "should";

import type { Kuzzle } from "../../index";

type AuthWorld = IWorld & {
  kuzzle: Kuzzle;
  jwt: string | null;
  previousJwt: string | null;
  rights: unknown[] | null;
  error: unknown;
};

Given<AuthWorld>(
  "I log in as {string}:{string}",
  async function (this: AuthWorld, username: string, password: string) {
    try {
      const jwt = await this.kuzzle.auth.login("local", { username, password });
      this.jwt = jwt;
    } catch (error) {
      this.jwt = "invalid";
      this.error = error;
    }
  },
);

When<AuthWorld>("I logout", async function (this: AuthWorld) {
  await this.kuzzle.auth.logout();
});

When<AuthWorld>("I refresh the JWT", async function (this: AuthWorld) {
  this.previousJwt = this.jwt;

  // we have to wait for at least 1s: if we ask Kuzzle to refresh a JWT that
  // has been generated during the same second, then the new JWT will be
  // identical to the one being refreshed
  await new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      this.kuzzle.auth
        .refreshToken()
        .then((token) => {
          this.jwt = token.jwt;
          resolve();
        })
        .catch((err) => reject(err));
    }, 1000);
  });
});

Then<AuthWorld>(
  "the previous JWT is now invalid",
  async function (this: AuthWorld) {
    // prevent false positives, just in case
    should(this.previousJwt).be.a.String().and.not.empty();
    should(this.previousJwt).not.eql(this.jwt);

    const op = retry.operation({ retries: 10, minTimeout: 500, factor: 1 });

    await new Promise<void>((resolve, reject) => {
      op.attempt(() => {
        this.kuzzle.auth
          .checkToken(this.previousJwt as string)
          .then((response) => {
            const err = response.valid
              ? new Error("Unexpected valid token")
              : null;

            if (op.retry(err)) {
              return;
            }

            if (err) {
              reject(err);
            } else {
              resolve();
            }
          })
          .catch((err) => reject(err));
      });
    });
  },
);

Then<AuthWorld>(
  /^the JWT is (in)?valid$/,
  async function (this: AuthWorld, not?: string) {
    const response = await this.kuzzle.auth.checkToken(this.jwt as string);

    if (not) {
      should(response.valid).be.false();
    } else {
      should(response.valid).be.true();
    }
  },
);

Given<AuthWorld>("I get my rights", async function (this: AuthWorld) {
  this.rights = await this.kuzzle.auth.getMyRights();
});

Then<AuthWorld>(
  "I have a vector with {int} rights",
  function (this: AuthWorld, nbRights: number) {
    should(this.rights).have.length(nbRights);
  },
);
