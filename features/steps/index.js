const {Given, When, Then} = require('cucumber');
const should = require('should');

Given('there is an index {string}', async function (index) {
  exists = await this.kuzzle.index.exists(index);

  if (!exists) {
    await this.kuzzle.index.create(index);
  }

  this.index = index;
});

Given('there is the indexes {string} and {string}', function (string, string2) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});


