const { Given, When, Then } = require('cucumber');
const should = require('should');

Given(/^the collection doesn't have a document with id '(.*?)'$/, function (id) {
  return this.kuzzle.document.delete(this.index, this.collection, id)
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

Given('the collection has a document with id {string}', function (id) {
  return this.kuzzle.document
    .create(
      this.index,
      this.collection,
      { a: 'document' },
      id,
      { refresh: 'wait_for'})
    .then(content => {
      this.content = content;
    });
});

Then('I get an error in the errors array', function () {
  should(this.content.errors).be.Array().not.be.empty();
});

Then('I should have no errors in the errors array', function () {
  should(this.content.errors).be.empty();
});

When('I check if {string} exists', function (id) {
  return this.kuzzle.document.exists(this.index, this.collection, id)
    .then(content => {
      this.content = content;
    });
});

When('I count how many documents there is in the collection', function () {
  return this.kuzzle.document.count(this.index, this.collection, {})
    .then(content => {
      this.content = content;
    });
});

When('I create a document in {string}', function (collection) {
  return this.kuzzle.document
    .create(
      this.index,
      collection,
      {a: 'document'},
      'some-id',
      {refresh: true})
    .then(content => {
      this.content = content;
    });
});

When('I create a document with id {string}', function (id) {
  this.ids = [id];

  return this.kuzzle.document
    .create(
      this.index,
      this.collection,
      {a: 'document'},
      id,
      {refresh: true})
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I create the documents [{string}, {string}]', function (id1, id2) {
  this.ids = [id1, id2];

  return this.kuzzle.document
    .mCreate(
      this.index,
      this.collection,
      [
        {_id: id1, body: {a: 'document'}},
        {_id: id2, body: {a: 'document'}}
      ],
      {
        refresh: 'wait_for'
      })
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I createOrReplace a document with id {string}', function (id) {
  this.ids = [id];

  return this.kuzzle.document
    .createOrReplace(
      this.index,
      this.collection,
      id,
      {a: 'replaced document'},
      {refresh: true})
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I createOrReplace the documents [{string}, {string}]', function (id1, id2) {
  this.ids = [id1, id2];

  return this.kuzzle.document
    .mCreateOrReplace(
      this.index,
      this.collection,
      [
        {_id: id1, body: {a: 'replaced document'}},
        {_id: id2, body: {a: 'replaced document'}}
      ],
      {
        refresh: 'wait_for'
      })
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I delete the document with id {string}', function (id) {
  this.ids = [id];

  return this.kuzzle.document.delete(this.index, this.collection, id)
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I delete the documents [{string}, {string}]', function (id1, id2) {
  this.ids = [id1, id2];

  return this.kuzzle.document
    .mDelete(
      this.index,
      this.collection,
      [id1, id2],
      {refresh: true})
    .then(content => {
      this.content = content;
    })
    .catch(error => {
      this.error = error;
    });
});

When('I replace a document with id {string}', function (id) {
  this.ids = [id];

  return this.kuzzle.document
    .replace(
      this.index,
      this.collection,
      id,
      {a: 'replaced document'},
      {refresh: true})
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I replace the documents [{string}, {string}]', function (id1, id2) {
  this.ids = [id1, id2];

  return this.kuzzle.document
    .mReplace(
      this.index,
      this.collection,
      [
        {_id: id1, body: {a: 'replaced document'}},
        {_id: id2, body: {a: 'replaced document'}}
      ],
      {refresh: true})
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I get documents [{string}, {string}]', function (id1, id2) {
  this.ids = [id1, id2];
  return this.kuzzle.document.mGet(this.index, this.collection, [id1, id2])
    .then(content => {
      this.content = content;
    });
});

When('I search a document with id {string}', function (id) {
  return this.kuzzle.document
    .search(
      this.index,
      this.collection,
      {
        query: {
          match: {
            _id: id
          }
        }
      })
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I search documents matching {string} with from {int} and size {int}', function (query, from, size) {
  return this.kuzzle.document
    .search(
      this.index,
      this.collection,
      JSON.parse(query),
      { from, size })
    .then(content => {
      this.content = content;
    });
});

When('I search the next documents', function () {
  return this.content.next()
    .then(content => {
      this.content = content;
    });
});

When('I update a document with id {string}', function (id) {
  this.ids = [id];

  return this.kuzzle.document
    .update(
      this.index,
      this.collection,
      id,
      {some: 'update'})
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});

When('I update the document with id {string} and content {string} = {string}', function (id, key, val) {
  return this.kuzzle.document
    .update(
      this.index,
      this.collection,
      id,
      { [key]: val })
    .then(content => {
      this.content = content;
    });
});

When('I update the documents [{string}, {string}]', function (id1, id2) {
  this.ids = [id1, id2];

  return this.kuzzle.document
    .mUpdate(
      this.index,
      this.collection,
      [
        {_id: id1, body: {a: 'replaced document', some: 'update'}},
        {_id: id2, body: {a: 'replaced document', some: 'update'}}
      ],
      { refresh: true })
    .then(content => {
      this.content = content;
    })
    .catch(err => {
      this.error = err;
    });
});


Then('I get an error with message {string}', function (message) {
  should(this.error).not.be.null();
  should(this.error.message).eql(message);
});

Then('I must have {int} documents in the collection', function (number) {
  return this.kuzzle.document.count(this.index, this.collection, {})
    .then(count => should(count).eql(number));
});

Then('the document is successfully created', function () {
  return this.kuzzle.document.get(this.index, this.collection, this.ids[0])
    .then(document => should(document).be.an.Object());
});

Then('the document is successfully deleted', function (cb) {
  this.kuzzle.document.get(this.index, this.collection, this.ids[0])
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

Then(/^the document is (successfully|not) found$/, function (yesno) {
  should(this.error).be.null();
  should(this.content.constructor.name).eql('DocumentsSearchResult');
  should(this.content.total).eql(yesno === 'successfully' ? 1 : 0);
});

Then('the document is successfully replaced', function () {
  return this.kuzzle.document.get(this.index, this.collection, this.ids[0])
    .then(document => should(document._source.a).eql('replaced document'));
});

Then('the document is successfully updated', function () {
  return this.kuzzle.document.get(this.index, this.collection, this.ids[0])
    .then(document => should(document._source.some).eql('update'));
});

Then('the document {string} should be created', function (id) {
  return this.kuzzle.document.get(this.index, this.collection, id)
    .then(document => should(document).not.be.null());
});

Then('the document {string} should be replaced', function (id) {
  return this.kuzzle.document.get(this.index, this.collection, id)
    .then(document => should(document._source.a).eql('replaced document'));
});

Then('the document {string} should be updated', function (id) {
  return this.kuzzle.document.get(this.index, this.collection, id)
    .then(document => should(document._source.some).eql('update'));
});

Then(/^the document should (not )?exist$/, function (not) {
  should(this.error).be.null();

  if (not) {
    should(this.content).be.false();
  }
  else {
    should(this.content).be.true();
  }
});

Then('the documents should be retrieved', function () {
  should(this.content.successes.length).eql(this.ids.length);
  should(this.content.errors).be.empty();

  const found = this.content.successes.map(r => r._id);

  for (const id of this.ids) {
    should(found.indexOf(id)).be.greaterThan(-1);
  }
});

Then(/^The search result should have (fetched|a total of) (\d+) documents$/, function (what, number) {
  should(this.content.constructor.name).eql('DocumentsSearchResult');

  let field;
  switch (what) {
    case 'a total of':
      field = 'total';
      break;
    case 'fetched':
      field = 'fetched';
      break;
  }

  should(this.content[field]).eql(number);
});
