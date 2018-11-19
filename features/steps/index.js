const {Given, When, Then} = require('cucumber');
const should = require('should');

Given('there is an index {string}', async function (index) {
  exists = await this.kuzzle.index.exists(index);

  if (!exists) {
    await this.kuzzle.index.create(index);
  }

  this.index = index;
});

Given('there is no index called {string}', async function (index) {
  try {
    this.content = await this.kuzzle.index.delete(index);
  }
  catch (error) {
    // do nothing
  }
});

Given('there is the indexes {string} and {string}', async function (index1, index2) {
  for (const index of [index1, index2]) {
    let exists = await this.kuzzle.index.exists(index);
    if (!exists) {
      await this.kuzzle.index.create(index)
    }
  }
});


When('I create an index called {string}', async function (index) {
  try {
    this.content = await this.kuzzle.index.create(index);
    this.index = index;
  }
  catch (error) {
    this.error = error;
  }
});

When('I delete the indexes {string} and {string}', async function (index1, index2) {
  this.content = await this.kuzzle.index.mDelete([index1, index2]);
});

When('I list indexes', async function () {
  try {
    this.content = await this.kuzzle.index.list();
  }
  catch (error) {
    this.error = error;
  }
});


Then('the index should exist', async function () {
  const exists = await this.kuzzle.index.exists(this.index);
  should(exists).be.true();
});

Then('indexes {string} and {string} don\'t exist', async function (index1, index2) {
  for (const index of [index1, index2]) {
    const exists = await this.kuzzle.index.exists(index);
    should(exists).be.false();
  }
});



