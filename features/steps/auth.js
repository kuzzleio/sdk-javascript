const
  {Given, When, Then} = require('cucumber'),
  should = require('should'),
  retry = require('retry');

Given('I log in as {string}:{string}', async function (username, password) {
  try {
    this.jwt = await this.kuzzle.auth.login('local', {
      username,
      password
    });
    this.error = null;
  }
  catch (error) {
    this.jwt = 'invalid';
    this.error = error;
  }
});

When('I logout', async function () {
  await this.kuzzle.auth.logout();
});

When('I refresh the JWT', function (cb) {
  this.previousJwt = this.jwt;

  // we have to wait for at least 1s: if we ask Kuzzle to refresh a JWT that
  // has been generated during the same second, then the new JWT will be
  // identical to the one being refreshed
  setTimeout(async () => {
    const token = await this.kuzzle.auth.refreshToken();
    this.jwt = token.jwt;
    cb();
  }, 1000);
});

Then('the previous JWT is now invalid', function (cb) {
  // prevent false positives, just in case
  should(this.previousJwt).be.a.String().and.not.empty();
  should(this.previousJwt).not.eql(this.jwt);

  const op = retry.operation({retries: 10, minTimeout: 500, factor: 1});

  op.attempt(() => {
    this.kuzzle.auth.checkToken(this.previousJwt)
      .then(response => {
        const err = response.valid ? new Error('Unexpected valid token') : null;

        if (op.retry(err)) {
          return;
        }

        cb(err);
      })
      .catch(err => cb(err));
  });
});

Then(/^the JWT is (in)?valid$/, async function (not) {
  const response = await this.kuzzle.auth.checkToken(this.jwt);

  if (not) {
    should(response.valid).be.false();
  }
  else {
    should(response.valid).be.true();
  }
});

Given('I get my rights', async function () {
  this.rights = await this.kuzzle.auth.getMyRights();
});

Then('I have a vector with {int} rights', function (nbRights) {
  should(this.rights).have.length(nbRights);
});
