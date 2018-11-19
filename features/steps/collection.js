const {Given, When, Then} = require('cucumber');
const should = require('should');

Given('has specifications', async function () {
  await this.kuzzle.collection.updateSpecifications(this.index, this.collection, {strict: true});
});

Given('it has a collection {string}', async function (collection) {
  await this.kuzzle.collection.create(this.index, collection);
  this.collection = collection;
});

Given('I truncate the collection {string}', async function (collection) {
  await this.kuzzle.collection.truncate(this.index, collection, {refresh: 'wait_for'});
});


When('I check if the collection {string} exists', async function (collection) {
  try {
    this.content = await this.kuzzle.collection.exist(this.index, collection);
  }
  catch (error) {
    this.error = error;
  }
});

When(/^I create a collection '(.*?)'( with a mapping)?$/, async function (collection, withMapping) {
  try  {
    const mapping = {
      properties: {
        gordon: {type: 'keyword'}
      }
    };

    this.content = await this.kuzzle.collection.create(
      this.index,
      collection,
      withMapping ? mapping : undefined
    );
  }
  catch (error) {
    this.error = error;
  }

});

When('I delete the specifications of {string}', async function (collection) {
  try {
    await this.kuzzle.collection.deleteSpecifications(this.index, collection);
  }
  catch (error) {
    this.error = error;
  }

});

When('I list the collections of {string}', async function (index) {
  try {
    this.content = await this.kuzzle.collection.list(index);
    this.total = this.content.collections.length;
  }
  catch (error) {
    this.error = error;
  }
});

When('I update the mapping of collection {string}', async function (collection) {
  try {
    this.content = await this.kuzzle.collection.updateMapping(this.index, collection, {
      properties: {
        gordon: {type: 'keyword'}
      }
    });
  }
  catch (error) {
    this.error = error;
  }

});

When('I update the specifications of the collection {string}', async function (collection) {
  try {
    this.content = await this.kuzzle.collection.updateSpecifications(this.index, collection, {strict: false});
  }
  catch (error) {
    this.error = error;
  }
});

When('I validate the specifications of {string}', async function (collection) {
  this.content = await this.kuzzle.collection.validateSpecifications(this.index, collection, {strict: true});
});


Then('the collection {string} should be empty', async function (collection) {
  const result = await this.kuzzle.document.search(this.index, collection, {});
  should(result.total).eql(0);
});

Then(/^the collection(?: '(.*?)')? should exist$/, async function (collection) {
  if (!collection) {
    collection = this.collection;
  }
  const exists = await this.kuzzle.collection.exists(this.index, collection);
  should(exists).be.true();
});

Then('the mapping of {string} should be updated', async function (collection) {
  const mapping = await this.kuzzle.collection.getMapping(this.index, collection);

  should(mapping[this.index].mappings[collection]).eql({
    properties: {
      gordon: {type: 'keyword'}
    }
  });
});

Then('the specifications of {string} should be updated', async function (collection) {
  const specifications = await this.kuzzle.collection.getSpecifications(this.index, collection);

  should(specifications.validation).eql({strict: false});
});

Then('the specifications of {string} must not exist', async function (collection) {
  try {
    await this.kuzzle.collection.getSpecifications(this.index, collection);
    should(true).be.false();
  }
  catch (error) {
    should(error.status).eql(404);
  }

});

Then('they should be validated', function () {
  should(this.content).eql({
    valid: true
  });
});
