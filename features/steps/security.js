const {Given, When} = require('cucumber');

Given('there is an user with id {string}', async function (id) {
  this.user = id;

  try {
    await this.kuzzle.security.createOrReplaceProfile('test', {
      policies: [{roleId: 'admin'}]
    });

    this.content = await this.kuzzle.security.createUser(id, {
      content: {
        profileIds: ['test']
      },
      credentials: {}
    });
  }
  catch (error) {
    // do nothing
  }
});

Given('the user has {string} credentials with name {string} and password {string}', async function (strategy, username, password) {
  try {
    await this.kuzzle.security.createCredentials(strategy, this.user, {
      username,
      password
    })
  }
  catch (error) {
    await this.kuzzle.security.updateCredentials(strategy, this.user, {
      username,
      password
    });
  }
});


When('I get my user info', async function () {
  this.content = await this.kuzzle.security.getUser(this.user);
});

When('I update my user custom data with the pair {string}:{string}', async function (key, val) {
  this.content = await this.kuzzle.security.updateUser(this.user, {
    [key]: val
  });
});
