const {Given, When, Then} = require('cucumber');
const should = require('should');

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


Then(/^the JWT is (in)?valid$/, async function (not) {
  const response = await this.kuzzle.auth.checkToken(this.jwt);

  if (not) {
    should(response.valid).be.false();
  }
  else {
    should(response.valid).be.true();
  }
});

