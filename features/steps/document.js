const {Given, When, Then} = require('cucumber');
const should = require('should');

Given(/^the collection doesn't have a document with id '(.*?)'$/, async function (id) {
  try {
    this.content = await this.kuzzle.document.delete(this.index, this.collection, id);
  }
  catch (error) {
    this.error = error;
  }
});

Given('the collection has a document with id {string}', async function (id) {
  this.content = await this.kuzzle.document.create(this.index, this.collection, id, {
    a: 'document'
  }, {
    refresh: 'wait_for'
  });
});


When('I check if {string} exists', async function (id) {
  this.content = await this.kuzzle.document.exists(this.index, this.collection, id);
});

When('I count how many documents there is in the collection', async function () {
  this.content = await this.kuzzle.document.count(this.index, this.collection, {});
});

When('I create a document in {string}', async function (collection) {
  this.content = await this.kuzzle.document.create(
    this.index,
    this.collection,
    'some-id',
    {a: 'document'},
    {refresh: true}
  );
});

When('I create a document with id {string}', async function (id) {
  this.ids = [id];

  try {
    this.content = await this.kuzzle.document.create(
      this.index,
      this.collection,
      id,
      {a: 'document'},
      {refresh: true}
    );
  }
  catch(error) {
    this.error = error;
  }
});

When('I create the documents [{string}, {string}]', async function (id1, id2) {
  this.ids = [id1, id2];

  try {
    this.content = await this.kuzzle.document.mCreate(
      this.index,
      this.collection,
      [
        {_id: id1, body: {a: 'document'}},
        {_id: id2, body: {a: 'document'}}
      ],
      {
        refresh: 'wait_for'
      }
    );
  }
  catch (error) {
    this.error = error;
  }

});

When('I createOrReplace a document with id {string}', async function (id) {
  this.ids = [id];

  try {
    this.content = await this.kuzzle.document.createOrReplace(
      this.index,
      this.collection,
      id,
      {a: 'replaced document'},
      {refresh: true}
    );
  }
  catch (error) {
    this.error = error;
  }
});

When('I createOrReplace the documents [{string}, {string}]', async function (id1, id2) {
  this.ids = [id1, id2];

  try {
    this.content = await this.kuzzle.document.mCreateOrReplace(
      this.index,
      this.collection,
      [
        {_id: id1, body: {a: 'replaced document'}},
        {_id: id2, body: {a: 'replaced document'}}
      ],
      {
        refresh: 'wait_for'
      }
    );
  }
  catch (error) {
    this.error = error;
  }
});

When('I delete the document with id {string}', async function (id) {
  this.ids = [id];

  try {
    this.content = await this.kuzzle.document.delete(this.index, this.collection, id);
  }
  catch (error) {
    this.error = error;
  }
});

When('I delete the documents [{string}, {string}]', async function (id1, id2) {
  this.ids = [id1, id2];

  try {
    this.content = await this.kuzzle.document.mDelete(
      this.index,
      this.collection,
      [id1, id2],
      {refresh: true}
    );
  }
  catch (error) {
    this.error = error;
  }
});

When('I replace a document with id {string}', async function (id) {
  this.ids = [id];

  try {
    this.content = await this.kuzzle.document.replace(
      this.index,
      this.collection,
      id,
      {a: 'replaced document'},
      {refresh: true}
    );
  }
  catch (error) {
    this.error = error;
  }
});

When('I replace the documents [{string}, {string}]', async function (id1, id2) {
  this.ids = [id1, id2];

  try {
    this.content = await this.kuzzle.document.mReplace(
      this.index,
      this.collection,
      [
        {_id: id1, body: {a: 'replaced document'}},
        {_id: id2, body: {a: 'replaced document'}}
      ],
      {refresh: true}
    );
  }
  catch (error) {
    this.error = error;
  }
});

When('I get documents [{string}, {string}]', async function (id1, id2) {
  this.ids = [id1, id2];
  this.content = await this.kuzzle.document.mGet(this.index, this.collection, [id1, id2]);
});

When('I search a document with id {string}', async function (id) {
  try {
    this.content = await this.kuzzle.document.search(
      this.index,
      this.collection,
      {
        query: {
          match: {
            _id: id
          }
        }
      }
    )
  }
  catch (error) {
    this.error = error;
  }
});

When('I search documents matching {string} with from {int} and size {int}', async function (query, from, size) {
  this.content = await this.kuzzle.document.search(
    this.index,
    this.collection,
    JSON.parse(query),
    {
      from,
      size
    }
  );
});

When('I search the next documents', async function () {
  this.content = await this.content.next();
});

When('I update a document with id {string}', async function (id) {
  this.ids = [id];

  try {
    this.content = await this.kuzzle.document.update(
      this.index,
      this.collection,
      id,
      {some: 'update'}
    );
  }
  catch (error) {
    this.error = error;
  }
});

When('I update the document with id {string} and content {string} = {string}', async function (id, key, val) {
  this.content = await this.kuzzle.document.update(
    this.index,
    this.collection,
    id,
    {[key]: val}
  );
});

When('I update the documents [{string}, {string}]', async function (id1, id2) {
  this.ids = [id1, id2];

  try {
    this.content = await this.kuzzle.document.mUpdate(
      this.index,
      this.collection,
      [
        {_id: id1, body: {a: 'replaced document', some: 'update'}},
        {_id: id2, body: {a: 'replaced document', some: 'update'}}
      ],
      {refresh: true}
    );
  }
  catch (error) {
    this.error = error;
  }
});


Then('I get an error with message {string}', function (message) {
  should(this.error)
    .not.be.null();
  should(this.error.message)
    .eql(message);
});

Then('I must have {int} documents in the collection', async function (number) {
  const count = await this.kuzzle.document.count(this.index, this.collection, {});
  should(count).eql(number);
});

Then('the document is successfully created', async function () {
  const document = await this.kuzzle.document.get(this.index, this.collection, this.ids[0]);
  should(document)
    .be.an.Object();
});

Then('the document is successfully deleted', async function () {
  try {
    await this.kuzzle.document.get(this.index, this.collection, this.ids[0]);
    // should fail
    should(true).be.false();
  }
  catch (error) {
    should(error.status).eql(404);
  }
});

Then(/^the document is (successfully|not) found$/, function (yesno) {
  should(this.error).be.null();
  should(this.content.constructor.name).eql('DocumentsSearchResult');
  should(this.content.total).eql(yesno === 'successfully' ? 1 : 0);
});

Then('the document is successfully replaced', async function () {
  const document = await this.kuzzle.document.get(this.index, this.collection, this.ids[0]);
  should(document._source.a).eql('replaced document');
});

Then('the document is successfully updated', async function () {
  const document = await this.kuzzle.document.get(this.index, this.collection, this.ids[0]);

  should(document._source.some).eql('update');
});

Then('the document {string} should be created', async function (id) {
  const document = await this.kuzzle.document.get(this.index, this.collection, id);

  should(document)
    .not.be.null();
});

Then('the document {string} should be replaced', async function (id) {
  const document = await this.kuzzle.document.get(this.index, this.collection, id);

  should(document._source.a)
    .eql('replaced document');
});

Then('the document {string} should be updated', async function (id) {
  const document = await this.kuzzle.document.get(this.index, this.collection, id);

  should(document._source.some)
    .eql('update');
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
  should(this.content.hits.length).eql(this.ids.length);
  should(this.content.total).eql(this.ids.length);

  const found = this.content.hits.map(r => r._id);

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
