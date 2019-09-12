const {Given, When} = require('cucumber');

Given('there is an user with id {string}', function (id) {
  this.user = id;

  return this.kuzzle.security
    .createOrReplaceProfile(
      'test',
      { policies: [{roleId: 'admin'}] })
    .then(() => this.kuzzle.security.createUser(id, {
      content: {
        profileIds: ['test']
      },
      credentials: {}
    }))
    .then(content => {
      this.content = content;
    })
    .catch(() => { /* do nothing */ });
});

Given('the user has {string} credentials with name {string} and password {string}', function (strategy, username, password) {
  return this.kuzzle.security
    .createCredentials(
      strategy,
      this.user,
      { username, password })
    .catch(() => this.kuzzle.security.updateCredentials(
      strategy,
      this.user,
      { username, password }));
});


When('I get my user info', function () {
  return this.kuzzle.security.getUser(this.user)
    .then(content => {
      this.content = content;
    });
});

When('I update my user custom data with the pair {string}:{string}', function (key, val) {
  return this.kuzzle.security.updateUser(this.user, { [key]: val })
    .then(content => {
      this.content = content;
    });
});
