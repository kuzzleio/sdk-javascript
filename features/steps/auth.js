const { Given, When, Then } = require("cucumber"),
  should = require("should"),
  retry = require("retry");

Given("I log in as {string}:{string}", function (username, password) {
  return this.kuzzle.auth
    .login("local", { username, password })
    .then((jwt) => {
      this.jwt = jwt;
    })
    .catch((error) => {
      this.jwt = "invalid";
      this.error = error;
    });
});

When("I logout", function () {
  return this.kuzzle.auth.logout();
});

When("I refresh the JWT", function (cb) {
  this.previousJwt = this.jwt;

  // we have to wait for at least 1s: if we ask Kuzzle to refresh a JWT that
  // has been generated during the same second, then the new JWT will be
  // identical to the one being refreshed
  setTimeout(() => {
    this.kuzzle.auth
      .refreshToken()
      .then((token) => {
        this.jwt = token.jwt;
        cb();
      })
      .catch((err) => cb(err));
  }, 1000);
});

Then("the previous JWT is now invalid", function (cb) {
  // prevent false positives, just in case
  should(this.previousJwt).be.a.String().and.not.empty();
  should(this.previousJwt).not.eql(this.jwt);

  const op = retry.operation({ retries: 10, minTimeout: 500, factor: 1 });

  op.attempt(() => {
    this.kuzzle.auth
      .checkToken(this.previousJwt)
      .then((response) => {
        const err = response.valid ? new Error("Unexpected valid token") : null;

        if (op.retry(err)) {
          return;
        }

        cb(err);
      })
      .catch((err) => cb(err));
  });
});

Then(/^the JWT is (in)?valid$/, function (not) {
  return this.kuzzle.auth.checkToken(this.jwt).then((response) => {
    if (not) {
      should(response.valid).be.false();
    } else {
      should(response.valid).be.true();
    }
  });
});

Given("I get my rights", function () {
  return this.kuzzle.auth.getMyRights().then((rights) => {
    this.rights = rights;
  });
});

Then("I have a vector with {int} rights", function (nbRights) {
  should(this.rights).have.length(nbRights);
});
