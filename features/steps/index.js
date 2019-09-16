const { Given, When, Then } = require('cucumber');
const should = require('should');

Given('there is an index {string}', function (index) {
  return this.kuzzle.index.exists(index)
    .then(exists => {
      if (!exists) {
        return this.kuzzle.index.create(index);
      }

      return null;
    })
    .then(() => {
      this.index = index;
    });
});

Given('there is no index called {string}', function (index) {
  return this.kuzzle.index.delete(index)
    .then(content => {
      this.content = content;
    })
    .catch(() => { /* do nothing */ });
});

Given('there is the indexes {string} and {string}', function (index1, index2) {
  const createIndex = (index, exists) => {
    if (!exists) {
      return this.kuzzle.index.create(index);
    }

    return null;
  };

  return this.kuzzle.index.exists(index1)
    .then(exists => createIndex(index1, exists))
    .then(() => this.kuzzle.index.exists(index2))
    .then(exists => createIndex(index2, exists));
});


When('I create an index called {string}', function (index) {
  return this.kuzzle.index.create(index)
    .then(content => {
      this.content = content;
      this.index = index;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I delete the indexes {string} and {string}', function (index1, index2) {
  return this.kuzzle.index.mDelete([index1, index2])
    .then(content => {
      this.content = content;
    });
});

When('I list indexes', function () {
  return this.kuzzle.index.list()
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});


Then('the index should exist', function () {
  return this.kuzzle.index.exists(this.index)
    .then(exists =>should(exists).be.true());
});

Then('indexes {string} and {string} don\'t exist', function (index1, index2) {
  const check = index => {
    return this.kuzzle.index.exists(index)
      .then(exists => should(exists).be.false());
  };

  return check(index1)
    .then(() => check(index2));
});
