const { Given, When, Then } = require('cucumber');
const should = require('should');

Given('has specifications', function () {
  return this.kuzzle.collection.updateSpecifications(
    this.index,
    this.collection,
    { strict: true });
});

Given('it has a collection {string}', function (collection) {
  return this.kuzzle.collection.create(this.index, collection)
    .then(() => {
      this.collection = collection;
    });
});

Given('I truncate the collection {string}', function (collection) {
  return this.kuzzle.collection.truncate(
    this.index,
    collection,
    { refresh: 'wait_for' });
});


When('I check if the collection {string} exists', function (collection) {
  return this.kuzzle.collection.exists(this.index, collection)
    .then(content => {
      this.content = content;
    })
    .catch(error => {
      this.error = error;
    });
});

When(/^I create a collection '(.*?)'( with a mapping)?$/, function (collection, withMapping) {
  const mapping = withMapping
    ? { properties: { gordon: {type: 'keyword'} } }
    : undefined;

  return this.kuzzle.collection.create(this.index, collection, mapping)
    .then(content => {
      this.content = content;
    })
    .catch (error => {
      this.error = error;
    });
});

When('I delete the specifications of {string}', function (collection) {
  return this.kuzzle.collection.deleteSpecifications(this.index, collection)
    .catch(error => {
      this.error = error;
    });
});

When('I list the collections of {string}', function (index) {
  return this.kuzzle.collection.list(index)
    .then(content => {
      this.content = content;
      this.total = this.content.collections.length;
    })
    .catch(error => {
      this.error = error;
    });
});

When('I update the mapping of collection {string}', function (collection) {
  return this.kuzzle.collection
    .updateMapping(this.index, collection, {
      properties: {
        gordon: {type: 'keyword'}
      }
    })
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I update the specifications of the collection {string}', function (collection) {
  return this.kuzzle.collection
    .updateSpecifications(this.index, collection, {strict: false})
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I validate the specifications of {string}', function (collection) {
  return this.kuzzle.collection
    .validateSpecifications(this.index, collection, {strict: true})
    .then(content => {
      this.content = content;
    });
});


Then('the collection {string} should be empty', function (collection) {
  return this.kuzzle.document.search(this.index, collection, {})
    .then(result => should(result.total).eql(0));
});

Then(/^the collection(?: '(.*?)')? should exist$/, function (collection) {
  const c = collection || this.collection;

  return this.kuzzle.collection.exists(this.index, c)
    .then(exists => should(exists).be.true());
});

Then('the mapping of {string} should be updated', function (collection) {
  return this.kuzzle.collection.getMapping(this.index, collection)
    .then(mapping => {
      should(mapping[this.index].mappings[collection]).eql({
        dynamic: 'true',
        properties: {
          gordon: {type: 'keyword'}
        }
      });
    });
});

Then('the specifications of {string} should be updated', function (collection) {
  return this.kuzzle.collection.getSpecifications(this.index, collection)
    .then(specifications => {
      should(specifications.validation).eql({strict: false});
    });
});

Then('the specifications of {string} must not exist', function (collection, cb) {
  this.kuzzle.collection.getSpecifications(this.index, collection)
    .then(() => cb(new Error('Expected promise to be rejected')))
    .catch(error => {
      try {
        should(error.status).eql(404);
        cb();
      }
      catch (e) {
        cb(e);
      }
    });
});

Then('they should be validated', function () {
  should(this.content).eql({
    valid: true
  });
});
